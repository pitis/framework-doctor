import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Diagnostic } from './types.js';

interface KnipExport {
  name: string;
  line?: number;
  col?: number;
}

interface KnipIssue {
  file: string;
  exports?: KnipExport[];
  types?: KnipExport[];
}

interface KnipJsonOutput {
  files?: string[];
  issues?: KnipIssue[];
}

interface KnipDiagnosticItem {
  file: string;
  message: string;
  rule: string;
  line?: number;
  column?: number;
}

const mapKnipDiagnostics = (
  diagnosticItems: KnipDiagnosticItem[],
  rootDirectory: string,
): Diagnostic[] =>
  diagnosticItems.map((diagnosticItem) => ({
    filePath: path.resolve(rootDirectory, diagnosticItem.file),
    plugin: 'knip',
    rule: diagnosticItem.rule,
    severity: 'warning',
    message: diagnosticItem.message,
    help: 'Remove dead code or keep it in an explicit public API boundary.',
    line: diagnosticItem.line ?? 0,
    column: diagnosticItem.column ?? 0,
    category: 'maintainability',
  }));

export const runKnipJson = async (rootDirectory: string): Promise<Diagnostic[]> => {
  const require = createRequire(import.meta.url);
  const knipMainPath = require.resolve('knip');
  const knipBin = path.join(path.dirname(knipMainPath), '../bin/knip.js');

  const runResult = spawnSync(process.execPath, [knipBin, '--reporter', 'json'], {
    cwd: rootDirectory,
    encoding: 'utf-8',
  });

  const standardOutput = runResult.stdout.toString().trim();
  if (!standardOutput) {
    return [];
  }

  let parsedPayload: KnipJsonOutput | null = null;
  try {
    parsedPayload = JSON.parse(standardOutput) as KnipJsonOutput;
  } catch {
    return [];
  }

  const diagnosticItems: KnipDiagnosticItem[] = [];

  for (const filePath of parsedPayload.files ?? []) {
    diagnosticItems.push({ file: filePath, message: `Unused file: ${filePath}`, rule: 'files' });
  }

  for (const issue of parsedPayload.issues ?? []) {
    for (const issueExport of issue.exports ?? []) {
      diagnosticItems.push({
        file: issue.file,
        message: `Unused export: ${issueExport.name}`,
        rule: 'exports',
        line: issueExport.line,
        column: issueExport.col,
      });
    }
    for (const issueType of issue.types ?? []) {
      diagnosticItems.push({
        file: issue.file,
        message: `Unused type: ${issueType.name}`,
        rule: 'types',
        line: issueType.line,
        column: issueType.col,
      });
    }
  }

  return mapKnipDiagnostics(diagnosticItems, rootDirectory);
};
