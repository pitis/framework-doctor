import path from "node:path";
import { performance } from "node:perf_hooks";
import type { DiagnoseOptions, DiagnoseResult } from "./types.js";
import { discoverProject } from "./utils/discover-project.js";
import { scan } from "./scan.js";

export type {
  Diagnostic,
  DiagnoseOptions,
  DiagnoseResult,
  ProjectInfo,
  ScanOptions,
  ScoreResult,
  SvelteDoctorConfig,
} from "./types.js";
export { ruleEnabledForVersion } from "./utils/version-rules.js";
export { getDiffInfo, filterSourceFiles } from "./utils/get-diff-files.js";

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
