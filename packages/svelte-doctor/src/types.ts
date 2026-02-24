import type { BaseDoctorConfig, Diagnostic, ScoreResult } from '@framework-doctor/core';

export type SvelteFramework = 'sveltekit' | 'svelte';

export interface ProjectInfo {
  rootDirectory: string;
  projectName: string;
  svelteVersion: string | null;
  framework: SvelteFramework;
  hasTypeScript: boolean;
  sourceFileCount: number;
}

export type {
  Diagnostic,
  DiffInfo,
  IgnoreConfig,
  ScoreGuardrailInput,
  ScoreResult,
} from '@framework-doctor/core';

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
  projectInfo: ProjectInfo;
}

export interface WorkspacePackage {
  name: string;
  directory: string;
}

export interface HandleErrorOptions {
  shouldExit: boolean;
}

export interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

export interface SvelteDoctorConfig extends BaseDoctorConfig {
  jsTsLint?: boolean;
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
