import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { HARDCODED_SECRET_RULES, runSecurityScan } from '../src/security/index.js';

describe('runSecurityScan', () => {
  const tempDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'framework-doctor-security-regex-test-'),
  );

  afterAll(() => {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  beforeEach(() => {
    for (const entry of fs.readdirSync(tempDirectory, { withFileTypes: true })) {
      fs.rmSync(path.join(tempDirectory, entry.name), { recursive: true, force: true });
    }
  });

  it('skips hardcoded-secret matches in comment-only lines', async () => {
    const fakeKey1 = `sk_live_${'x'.repeat(24)}`;
    const fakeKey2 = `sk_live_${'y'.repeat(24)}`;
    const fakeKey3 = `sk_live_${'z'.repeat(24)}`;

    fs.writeFileSync(
      path.join(tempDirectory, 'security-comment.ts'),
      [`// ${fakeKey1}`, `* ${fakeKey2}`, `const apiKey = "${fakeKey3}";`].join('\n'),
    );

    const diagnostics = await runSecurityScan(tempDirectory, [], {
      plugin: 'react-doctor',
      rules: HARDCODED_SECRET_RULES,
    });

    const stripeDiagnostics = diagnostics.filter(
      (diagnostic) => diagnostic.rule === 'hardcoded-secret-stripe-live',
    );

    expect(stripeDiagnostics.length).toBe(1);
    expect(stripeDiagnostics[0].line).toBe(3);
  });
});
