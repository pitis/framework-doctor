import { describe, expect, it, vi } from 'vitest';

const mockedProjectInfo = {
  rootDirectory: '/mock/project',
  projectName: 'mock-angular-project',
  angularVersion: '^19.0.0',
  hasTypeScript: true,
  sourceFileCount: 36,
};

const mockedScanResult = {
  diagnostics: [],
  scoreResult: { score: 98, label: 'Great' },
  skippedChecks: [],
  projectInfo: mockedProjectInfo,
};

vi.mock('../src/scan.js', () => ({
  scan: vi.fn(async () => mockedScanResult),
}));

vi.mock('../src/utils/discover-project.js', () => ({
  discoverProject: vi.fn(() => mockedProjectInfo),
}));

import { diagnose } from '../src/index.js';

describe('diagnose', () => {
  it('returns mapped diagnose response', async () => {
    const result = await diagnose('/mock/project', {
      lint: false,
      deadCode: false,
    });

    expect(result.project).toEqual(mockedProjectInfo);
    expect(result.score).toEqual(mockedScanResult.scoreResult);
    expect(result.diagnostics).toEqual([]);
    expect(result.elapsedMilliseconds).toBeGreaterThanOrEqual(0);
  });
});
