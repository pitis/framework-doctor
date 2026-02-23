import { SOURCE_FILE_PATTERN } from '../constants.js';
import type { Diagnostic, VueDoctorConfig } from '../types.js';
import { checkReducedMotion } from './check-reduced-motion.js';
import { filterIgnoredDiagnostics } from './filter-diagnostics.js';

export const computeVueIncludePaths = (includePaths: string[]): string[] | undefined =>
  includePaths.length > 0
    ? includePaths.filter((filePath) => SOURCE_FILE_PATTERN.test(filePath))
    : undefined;

export const combineDiagnostics = (
  lintDiagnostics: Diagnostic[],
  deadCodeDiagnostics: Diagnostic[],
  securityDiagnostics: Diagnostic[],
  directory: string,
  isDiffMode: boolean,
  userConfig: VueDoctorConfig | null,
): Diagnostic[] => {
  const allDiagnostics = [
    ...lintDiagnostics,
    ...deadCodeDiagnostics,
    ...securityDiagnostics,
    ...(isDiffMode ? [] : checkReducedMotion(directory)),
  ];
  return userConfig ? filterIgnoredDiagnostics(allDiagnostics, userConfig) : allDiagnostics;
};
