export interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  help: string;
  line: number;
  column: number;
  category: string;
  weight?: number;
}

export interface ScoreResult {
  score: number;
  label: string;
}

export interface DiffInfo {
  currentBranch: string;
  baseBranch: string;
  changedFiles: string[];
  isCurrentChanges?: boolean;
}

export interface IgnoreConfig {
  rules?: string[];
  files?: string[];
}

export interface BaseDoctorConfig {
  ignore?: IgnoreConfig;
  lint?: boolean;
  deadCode?: boolean;
  verbose?: boolean;
  diff?: boolean | string;
  analytics?: boolean;
}
