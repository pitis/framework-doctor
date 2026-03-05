import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scan } from '../src/scan.js';

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, 'fixtures');
const MAX_SCAN_DURATION_MS = 30_000;

describe('scan performance', () => {
  it('completes React scan within budget for fixture project', async () => {
    const startTime = performance.now();

    await scan(path.join(FIXTURES_DIRECTORY, 'basic-react'), {
      lint: true,
      deadCode: true,
      audit: false,
    });

    const elapsedMilliseconds = performance.now() - startTime;
    expect(elapsedMilliseconds).toBeLessThan(MAX_SCAN_DURATION_MS);
  });
});
