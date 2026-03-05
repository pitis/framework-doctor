import type { BaseDoctorConfig, Diagnostic, ScoreResult } from '@framework-doctor/core';

export interface ProjectInfo {
  rootDirectory: string;
  projectName: string;
  angularVersion: string | null;
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
  deadCode?: boolean;
  audit?: boolean;
  verbose?: boolean;
  scoreOnly?: boolean;
  format?: 'text' | 'json';
  includePaths?: string[];
}

export interface ScanResult {
  diagnostics: Diagnostic[];
  scoreResult: ScoreResult | null;
  skippedChecks: string[];
  projectInfo: ProjectInfo;
}

export interface AngularDoctorConfig extends BaseDoctorConfig {}

export interface WorkspacePackage {
  name: string;
  directory: string;
}

export interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

export interface DiagnoseOptions {
  lint?: boolean;
  deadCode?: boolean;
  includePaths?: string[];
}

export interface DiagnoseResult {
  diagnostics: Diagnostic[];
  score: ScoreResult | null;
  project: ProjectInfo;
  elapsedMilliseconds: number;
}
