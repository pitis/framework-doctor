import { runAudit } from '@framework-doctor/core';
import type { Diagnostic, ScanOptions, ScanResult, SvelteDoctorConfig } from './types.js';
import { checkReducedMotion } from './utils/check-reduced-motion.js';
import { discoverProject } from './utils/discover-project.js';
import { filterIgnoredDiagnostics } from './utils/filter-diagnostics.js';
import { loadConfig } from './utils/load-config.js';
import { runKnip } from './utils/run-knip.js';
import { runOxlint } from './utils/run-oxlint.js';
import { runSecurityScan } from './utils/run-security-scan.js';
import { runSvelteCheck } from './utils/run-svelte-check.js';
import { calculateScore } from './utils/score.js';

interface ResolvedScanOptions {
  lint: boolean;
  jsTsLint: boolean;
  deadCode: boolean;
  audit: boolean;
  fix: boolean;
  includePaths: string[];
}

const resolveOptions = (
  options: ScanOptions,
  userConfig: SvelteDoctorConfig | null,
): ResolvedScanOptions => ({
  lint: options.lint ?? userConfig?.lint ?? true,
  jsTsLint: options.jsTsLint ?? userConfig?.jsTsLint ?? true,
  deadCode: options.deadCode ?? userConfig?.deadCode ?? true,
  audit: options.audit ?? userConfig?.audit ?? true,
  fix: options.fix ?? false,
  includePaths: options.includePaths ?? [],
});

export const scan = async (directory: string, options: ScanOptions = {}): Promise<ScanResult> => {
  const projectInfo = discoverProject(directory);
  if (!projectInfo.svelteVersion) {
    throw new Error('No Svelte dependency found in package.json');
  }

  const userConfig = loadConfig(directory);
  const resolved = resolveOptions(options, userConfig);
  const skippedChecks: string[] = [];

  let lintDiagnostics: Diagnostic[] = [];
  if (resolved.lint) {
    try {
      lintDiagnostics = await runSvelteCheck(
        directory,
        resolved.includePaths,
        projectInfo.svelteVersion,
      );
    } catch {
      skippedChecks.push('lint');
    }
  }

  let jsTsLintDiagnostics: Diagnostic[] = [];
  if (resolved.jsTsLint) {
    try {
      jsTsLintDiagnostics = await runOxlint(
        directory,
        projectInfo.hasTypeScript,
        resolved.includePaths,
        resolved.fix,
      );
    } catch {
      skippedChecks.push('js/ts lint');
    }
  }

  let deadCodeDiagnostics: Diagnostic[] = [];
  if (resolved.deadCode && resolved.includePaths.length === 0) {
    try {
      deadCodeDiagnostics = await runKnip(directory);
    } catch {
      skippedChecks.push('dead code');
    }
  }

  let securityDiagnostics: Diagnostic[] = [];
  if (resolved.lint) {
    try {
      securityDiagnostics = await runSecurityScan(
        directory,
        resolved.includePaths,
        projectInfo.framework,
      );
    } catch {
      skippedChecks.push('security');
    }
  }

  const reducedMotionDiagnostics =
    resolved.includePaths.length === 0 ? checkReducedMotion(directory) : [];

  const auditDiagnostics =
    resolved.audit && resolved.includePaths.length === 0 ? runAudit(directory).diagnostics : [];

  const diagnostics = filterIgnoredDiagnostics(
    [
      ...lintDiagnostics,
      ...jsTsLintDiagnostics,
      ...deadCodeDiagnostics,
      ...securityDiagnostics,
      ...reducedMotionDiagnostics,
      ...auditDiagnostics,
    ],
    userConfig,
  );

  const totalFilesScanned =
    resolved.includePaths.length > 0 ? resolved.includePaths.length : projectInfo.sourceFileCount;

  const hasHighOrCriticalSecurityFindings = diagnostics.some(
    (diagnostic) => diagnostic.category === 'security' && diagnostic.severity === 'error',
  );

  return {
    diagnostics,
    scoreResult: calculateScore(diagnostics, totalFilesScanned, {
      hasHighOrCriticalSecurityFindings,
    }),
    skippedChecks,
    projectInfo,
  };
};
