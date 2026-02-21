export type SvelteFramework = "sveltekit" | "svelte";

export interface ProjectInfo {
  rootDirectory: string;
  projectName: string;
  svelteVersion: string | null;
  framework: SvelteFramework;
  hasTypeScript: boolean;
  sourceFileCount: number;
}

export interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: "error" | "warning";
  message: string;
  help: string;
  line: number;
  column: number;
  category: "correctness" | "performance" | "maintainability" | "accessibility" | "security";
  weight?: number;
}

export interface ScoreResult {
  score: number;
  label: string;
}

export interface ScanOptions {
  lint?: boolean;
  jsTsLint?: boolean;
  deadCode?: boolean;
  verbose?: boolean;
  scoreOnly?: boolean;
  includePaths?: string[];
}

export interface ScanResult {
  diagnostics: Diagnostic[];
  scoreResult: ScoreResult;
  skippedChecks: string[];
}

export interface SvelteDoctorIgnoreConfig {
  rules?: string[];
  files?: string[];
}

export interface SvelteDoctorConfig {
  ignore?: SvelteDoctorIgnoreConfig;
  lint?: boolean;
  jsTsLint?: boolean;
  deadCode?: boolean;
  verbose?: boolean;
  diff?: boolean | string;
}

export interface VersionedRuleMeta {
  minVersion?: string;
  maxVersion?: string;
}

export interface DiagnoseOptions {
  lint?: boolean;
  jsTsLint?: boolean;
  deadCode?: boolean;
  includePaths?: string[];
}

export interface DiagnoseResult {
  diagnostics: Diagnostic[];
  score: ScoreResult;
  project: ProjectInfo;
  elapsedMilliseconds: number;
}
