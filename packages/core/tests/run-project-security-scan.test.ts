import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { getFrameworkProfile, runProjectSecurityScan } from '../src/security/index.js';

describe('runProjectSecurityScan', () => {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'framework-doctor-security-test-'));
  const nextjsProfile = getFrameworkProfile('react-doctor', 'nextjs');
  const angularProfile = getFrameworkProfile('angular-doctor', 'angular');
  const reactViteProfile = getFrameworkProfile('react-doctor', 'vite');

  afterAll(() => {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  beforeEach(() => {
    for (const entry of fs.readdirSync(tempDirectory, { withFileTypes: true })) {
      const fullPath = path.join(tempDirectory, entry.name);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });

  it('returns env-leak diagnostic when NEXT_PUBLIC_ var has secret-like name', () => {
    if (!nextjsProfile) throw new Error('Next.js profile not found');
    fs.writeFileSync(path.join(tempDirectory, '.env'), 'NEXT_PUBLIC_SECRET_KEY=foo\n');
    const diagnostics = runProjectSecurityScan(tempDirectory, nextjsProfile);
    const envLeaks = diagnostics.filter((diagnostic) => diagnostic.rule === 'env-leak');
    expect(envLeaks.length).toBeGreaterThan(0);
    expect(envLeaks[0].message).toContain('NEXT_PUBLIC_SECRET_KEY');
  });

  it('returns gitignore-missing-env when .gitignore exists but does not contain .env', () => {
    if (!nextjsProfile) throw new Error('Next.js profile not found');
    fs.writeFileSync(path.join(tempDirectory, '.gitignore'), 'node_modules\n');
    const diagnostics = runProjectSecurityScan(tempDirectory, nextjsProfile);
    const gitignoreDiagnostics = diagnostics.filter(
      (diagnostic) => diagnostic.rule === 'gitignore-missing-env',
    );
    expect(gitignoreDiagnostics.length).toBe(1);
  });

  it('returns no-gitignore when .gitignore does not exist', () => {
    if (!nextjsProfile) throw new Error('Next.js profile not found');
    const diagnostics = runProjectSecurityScan(tempDirectory, nextjsProfile);
    const noGitignore = diagnostics.filter((diagnostic) => diagnostic.rule === 'no-gitignore');
    expect(noGitignore.length).toBe(1);
  });

  it('does not report env-leak for safe NEXT_PUBLIC_ vars', () => {
    if (!nextjsProfile) throw new Error('Next.js profile not found');
    fs.writeFileSync(path.join(tempDirectory, '.env'), 'NEXT_PUBLIC_APP_URL=https://example.com\n');
    const diagnostics = runProjectSecurityScan(tempDirectory, nextjsProfile);
    const envLeaks = diagnostics.filter((diagnostic) => diagnostic.rule === 'env-leak');
    expect(envLeaks.length).toBe(0);
  });

  it('returns unprotected-api-route for mutating Next.js route without auth signals', () => {
    if (!nextjsProfile) throw new Error('Next.js profile not found');
    fs.mkdirSync(path.join(tempDirectory, 'app', 'api', 'profile'), { recursive: true });
    fs.writeFileSync(path.join(tempDirectory, '.gitignore'), '.env\n');
    fs.writeFileSync(
      path.join(tempDirectory, 'next.config.ts'),
      'export default { async headers() { return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: "default-src \'self\'" }] }]; } }',
    );
    fs.writeFileSync(path.join(tempDirectory, 'middleware.ts'), 'export const config = {};');
    fs.writeFileSync(
      path.join(tempDirectory, 'app', 'api', 'profile', 'route.ts'),
      'export async function POST() { return Response.json({ ok: true }); }',
    );

    const diagnostics = runProjectSecurityScan(tempDirectory, nextjsProfile);
    const routeDiagnostics = diagnostics.filter(
      (diagnostic) => diagnostic.rule === 'unprotected-api-route',
    );
    expect(routeDiagnostics.length).toBe(1);
    expect(routeDiagnostics[0].message).toContain('app/api/profile/route.ts');
  });

  it('does not report unprotected-api-route when auth signals are present', () => {
    if (!nextjsProfile) throw new Error('Next.js profile not found');
    fs.mkdirSync(path.join(tempDirectory, 'app', 'api', 'secure-profile'), { recursive: true });
    fs.writeFileSync(path.join(tempDirectory, '.gitignore'), '.env\n');
    fs.writeFileSync(
      path.join(tempDirectory, 'next.config.ts'),
      'export default { async headers() { return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: "default-src \'self\'" }] }]; } }',
    );
    fs.writeFileSync(path.join(tempDirectory, 'middleware.ts'), 'export const config = {};');
    fs.writeFileSync(
      path.join(tempDirectory, 'app', 'api', 'secure-profile', 'route.ts'),
      'export async function DELETE() { const session = await getServerSession(); return Response.json({ session }); }',
    );

    const diagnostics = runProjectSecurityScan(tempDirectory, nextjsProfile);
    const routeDiagnostics = diagnostics.filter(
      (diagnostic) => diagnostic.rule === 'unprotected-api-route',
    );
    expect(routeDiagnostics.length).toBe(0);
  });

  it('returns public-config-leak for Angular environment secrets', () => {
    if (!angularProfile) throw new Error('Angular profile not found');
    fs.mkdirSync(path.join(tempDirectory, 'src', 'environments'), { recursive: true });
    fs.writeFileSync(
      path.join(tempDirectory, 'src', 'environments', 'environment.ts'),
      'export const environment = { production: false, firebaseSecret: "abc123" };',
    );

    const diagnostics = runProjectSecurityScan(tempDirectory, angularProfile);
    const publicConfigLeaks = diagnostics.filter(
      (diagnostic) => diagnostic.rule === 'public-config-leak',
    );
    expect(publicConfigLeaks.length).toBe(1);
    expect(publicConfigLeaks[0].message).toContain('firebaseSecret');
  });

  it('returns unprotected-api-route for mutating server/api handler in Vite profile', () => {
    if (!reactViteProfile) throw new Error('React Vite profile not found');
    fs.mkdirSync(path.join(tempDirectory, 'server', 'api'), { recursive: true });
    fs.writeFileSync(
      path.join(tempDirectory, 'server', 'api', 'users.ts'),
      'const router = { post(path: string, handler: unknown) {} }; router.post("/users", () => ({ ok: true }));',
    );

    const diagnostics = runProjectSecurityScan(tempDirectory, reactViteProfile);
    const routeDiagnostics = diagnostics.filter(
      (diagnostic) => diagnostic.rule === 'unprotected-api-route',
    );
    expect(routeDiagnostics.length).toBe(1);
    expect(routeDiagnostics[0].message).toContain('server/api/users.ts');
  });

  it('does not report unprotected-api-route for guarded mutating server/api handler', () => {
    if (!reactViteProfile) throw new Error('React Vite profile not found');
    fs.mkdirSync(path.join(tempDirectory, 'server', 'api'), { recursive: true });
    fs.writeFileSync(
      path.join(tempDirectory, 'server', 'api', 'users.ts'),
      'const router = { post(path: string, handler: unknown) {} }; const auth = true; router.post("/users", () => auth);',
    );

    const diagnostics = runProjectSecurityScan(tempDirectory, reactViteProfile);
    const routeDiagnostics = diagnostics.filter(
      (diagnostic) => diagnostic.rule === 'unprotected-api-route',
    );
    expect(routeDiagnostics.length).toBe(0);
  });
});
