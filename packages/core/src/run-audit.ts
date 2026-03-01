import { spawnSync } from 'node:child_process';
import type { Diagnostic } from './types.js';

export interface AuditResult {
  diagnostics: Diagnostic[];
  hasHighOrCritical: boolean;
}

export const runAudit = (rootDirectory: string): AuditResult => {
  try {
    const result = spawnSync('pnpm', ['audit', '--json'], {
      cwd: rootDirectory,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.error || result.status === null) {
      return { diagnostics: [], hasHighOrCritical: false };
    }

    let parsed: { vulnerabilities?: Record<string, { severity?: string }> };
    try {
      parsed = JSON.parse(result.stdout ?? '{}') as {
        vulnerabilities?: Record<string, { severity?: string }>;
      };
    } catch {
      return { diagnostics: [], hasHighOrCritical: false };
    }

    const vulns = parsed.vulnerabilities ?? {};
    const highOrCritical = Object.values(vulns).filter(
      (v) => v.severity === 'high' || v.severity === 'critical',
    );

    if (highOrCritical.length === 0) {
      return { diagnostics: [], hasHighOrCritical: false };
    }

    const diagnostics: Diagnostic[] = [
      {
        filePath: 'package.json',
        plugin: 'framework-doctor',
        rule: 'dependency-audit',
        severity: 'warning',
        message: `Found ${highOrCritical.length} high or critical vulnerability(ies). Run: pnpm audit`,
        help: 'Run `pnpm audit` to see details and `pnpm audit --fix` to fix automatically where possible.',
        line: 0,
        column: 0,
        category: 'security',
      },
    ];

    return { diagnostics, hasHighOrCritical: true };
  } catch {
    return { diagnostics: [], hasHighOrCritical: false };
  }
};
