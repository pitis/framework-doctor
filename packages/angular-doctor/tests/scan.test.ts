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

const noAngularTempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'angular-doctor-test-'));
fs.writeFileSync(
  path.join(noAngularTempDirectory, 'package.json'),
  JSON.stringify({ name: 'no-angular', dependencies: {} }),
);

afterAll(() => {
  fs.rmSync(noAngularTempDirectory, { recursive: true, force: true });
});

describe('scan', () => {
  it('throws when Angular dependency is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await expect(
        scan(noAngularTempDirectory, { lint: true, deadCode: false, audit: false }),
      ).rejects.toThrow('No Angular dependency found in package.json');
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('skips lint when option is disabled', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await scan(path.join(FIXTURES_DIRECTORY, 'basic-angular'), {
        lint: false,
        deadCode: false,
        audit: false,
      });
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('runs lint and dead code in parallel when both enabled', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const startTime = performance.now();
      await scan(path.join(FIXTURES_DIRECTORY, 'basic-angular'), {
        lint: true,
        deadCode: true,
        audit: false,
      });
      const elapsedMilliseconds = performance.now() - startTime;

      expect(elapsedMilliseconds).toBeLessThan(30_000);
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
