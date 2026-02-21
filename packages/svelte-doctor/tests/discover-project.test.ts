import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { discoverProject } from '../src/utils/discover-project.js';

const createdDirs: string[] = [];

const createTempProject = (packageJson: Record<string, unknown>): string => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-doctor-test-'));
  createdDirs.push(tempDir);
  fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  return tempDir;
};

afterEach(() => {
  for (const dir of createdDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('discoverProject', () => {
  it('detects svelte version and default framework', () => {
    const projectDir = createTempProject({
      name: 'plain-svelte-app',
      dependencies: {
        svelte: '^5.0.0',
      },
    });

    const result = discoverProject(projectDir);
    expect(result.svelteVersion).toBe('^5.0.0');
    expect(result.framework).toBe('svelte');
  });

  it('detects sveltekit when @sveltejs/kit exists', () => {
    const projectDir = createTempProject({
      name: 'sveltekit-app',
      devDependencies: {
        svelte: '^5.0.0',
        '@sveltejs/kit': '^2.0.0',
      },
    });

    const result = discoverProject(projectDir);
    expect(result.framework).toBe('sveltekit');
  });
});
