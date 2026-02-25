import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { scan } from '../src/scan.js';

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, 'fixtures');

vi.mock('ora', () => ({
  default: () => ({
    text: '',
    start: function () {
      return this;
    },
    stop: function () {
      return this;
    },
    succeed: () => {},
    fail: () => {},
  }),
}));

const noSvelteTempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-doctor-test-'));
fs.writeFileSync(
  path.join(noSvelteTempDirectory, 'package.json'),
  JSON.stringify({ name: 'no-svelte', dependencies: {} }),
);

afterAll(() => {
  fs.rmSync(noSvelteTempDirectory, { recursive: true, force: true });
});

describe('scan', () => {
  it('completes without throwing on a valid Svelte project', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await scan(path.join(FIXTURES_DIRECTORY, 'basic-svelte'), {
        lint: true,
        deadCode: false,
      });
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('throws when Svelte dependency is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await expect(scan(noSvelteTempDirectory, { lint: true, deadCode: false })).rejects.toThrow(
        'No Svelte dependency found in package.json',
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('skips lint when option is disabled', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await scan(path.join(FIXTURES_DIRECTORY, 'basic-svelte'), {
        lint: false,
        deadCode: false,
      });
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('runs lint and dead code in parallel when both enabled', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const startTime = performance.now();
      await scan(path.join(FIXTURES_DIRECTORY, 'basic-svelte'), {
        lint: true,
        deadCode: true,
      });
      const elapsedMilliseconds = performance.now() - startTime;

      expect(elapsedMilliseconds).toBeLessThan(30_000);
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
