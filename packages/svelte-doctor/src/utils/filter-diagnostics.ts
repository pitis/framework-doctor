import path from 'node:path';
import type { Diagnostic, SvelteDoctorConfig } from '../types.js';

const normalizePath = (filePath: string): string => filePath.split(path.sep).join('/');

export const filterIgnoredDiagnostics = (
  diagnostics: Diagnostic[],
  config: SvelteDoctorConfig | null,
): Diagnostic[] => {
  const ignoredRules = new Set(config?.ignore?.rules ?? []);
  const ignoredFileSubstrings = config?.ignore?.files ?? [];

  return diagnostics.filter((diagnostic) => {
    const ruleName = `${diagnostic.plugin}/${diagnostic.rule}`;
    if (ignoredRules.has(ruleName)) return false;

    const normalized = normalizePath(diagnostic.filePath);
    if (ignoredFileSubstrings.some((pattern) => normalized.includes(pattern.replace('/**', '')))) {
      return false;
    }
    return true;
  });
};
