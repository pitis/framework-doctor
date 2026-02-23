import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { scan } from './scan.js';
import type { DiagnoseOptions, DiagnoseResult } from './types.js';
import { discoverProject } from './utils/discover-project.js';

export type {
  DiagnoseOptions,
  DiagnoseResult,
  Diagnostic,
  ProjectInfo,
  ScanOptions,
  ScoreResult,
  VueDoctorConfig,
} from './types.js';
export { filterSourceFiles, getDiffInfo } from './utils/get-diff-files.js';

export const diagnose = async (
  directory: string,
  options: DiagnoseOptions = {},
): Promise<DiagnoseResult> => {
  const start = performance.now();
  const root = path.resolve(directory);
  const project = discoverProject(root);
  const result = await scan(root, options);

  return {
    diagnostics: result.diagnostics,
    score: result.scoreResult,
    project,
    elapsedMilliseconds: performance.now() - start,
  };
};
