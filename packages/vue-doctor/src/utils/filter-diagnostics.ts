import { compileGlobPattern } from '@framework-doctor/core';
import type { Diagnostic, VueDoctorConfig } from '../types.js';

export const filterIgnoredDiagnostics = (
  diagnostics: Diagnostic[],
  config: VueDoctorConfig | null,
): Diagnostic[] => {
  if (!config) return diagnostics;

  const ignoredRules = new Set(Array.isArray(config.ignore?.rules) ? config.ignore.rules : []);
  const ignoredFilePatterns = Array.isArray(config.ignore?.files)
    ? config.ignore.files.map(compileGlobPattern)
    : [];

  if (ignoredRules.size === 0 && ignoredFilePatterns.length === 0) {
    return diagnostics;
  }

  return diagnostics.filter((diagnostic) => {
    const ruleIdentifier = `${diagnostic.plugin}/${diagnostic.rule}`;
    if (ignoredRules.has(ruleIdentifier)) return false;

    const normalizedPath = diagnostic.filePath.replace(/\\/g, '/').replace(/^\.\//, '');
    if (ignoredFilePatterns.some((pattern) => pattern.test(normalizedPath))) return false;

    return true;
  });
};
