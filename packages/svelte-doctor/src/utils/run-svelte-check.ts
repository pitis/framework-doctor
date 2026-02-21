import { spawnSync } from 'node:child_process';
import path from 'node:path';
import type { Diagnostic } from '../types.js';
import { ruleEnabledForVersion } from './version-rules.js';

interface SvelteCheckRecord {
  file?: string;
  filename?: string;
  line?: number;
  column?: number;
  character?: number;
  code?: string;
  message?: string;
  severity?: 'error' | 'warning';
  type?: 'ERROR' | 'WARNING';
}

const KNOWN_SVELTE5_RULES: Record<
  string,
  { minVersion: string; category: Diagnostic['category'] }
> = {
  'a11y-missing-attribute': { minVersion: '5.0.0', category: 'accessibility' },
  'a11y-interactive-supports-focus': { minVersion: '5.0.0', category: 'accessibility' },
  'a11y-click-events-have-key-events': { minVersion: '5.0.0', category: 'accessibility' },
  'a11y-consider-explicit-label': { minVersion: '5.0.0', category: 'accessibility' },
  'a11y-invalid-attribute': { minVersion: '5.0.0', category: 'accessibility' },
  'css-unused-selector': { minVersion: '5.0.0', category: 'maintainability' },
};

/** Parse machine format: TIMESTAMP TYPE "file" line:col "message" */
const parseMachineFormat = (rawOutput: string): SvelteCheckRecord[] => {
  const records: SvelteCheckRecord[] = [];
  const lines = rawOutput.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      /^\d+\s+START\s/.test(trimmed) ||
      /^\d+\s+COMPLETED\s/.test(trimmed) ||
      /^\d+\s+FAILURE\s/.test(trimmed)
    )
      continue;

    const match = trimmed.match(
      /^\d+\s+(ERROR|WARNING)\s+"((?:[^"\\]|\\.)*)"\s+(\d+):(\d+)\s+"((?:[^"\\]|\\.)*)"$/,
    );
    if (!match) continue;

    const [, type, file, lineStr, colStr, message] = match;
    const codeMatch = message.match(/svelte\.dev\/e\/([a-z0-9_-]+)/i);
    const code = codeMatch ? codeMatch[1].replace(/_/g, '-') : 'unknown';
    const cleanMessage = message
      .replace(/\\n.*$/s, '')
      .replace(/\\"/g, '"')
      .trim();

    records.push({
      file,
      filename: file,
      line: parseInt(lineStr, 10),
      column: parseInt(colStr, 10),
      message: cleanMessage,
      type: type as 'ERROR' | 'WARNING',
      severity: type === 'ERROR' ? 'error' : 'warning',
      code,
    });
  }

  return records;
};

export const runSvelteCheck = async (
  rootDirectory: string,
  includePaths: string[],
  svelteVersion: string,
): Promise<Diagnostic[]> => {
  const args = ['svelte-check', '--output', 'machine'];

  const result = spawnSync('pnpm', args, {
    cwd: rootDirectory,
    encoding: 'utf-8',
    shell: process.platform === 'win32',
  });

  const records = parseMachineFormat(`${result.stdout}\n${result.stderr}`);
  const diagnostics = records
    .filter((record) => Boolean(record.file) && Boolean(record.message))
    .map((record) => {
      const code = record.code ?? 'unknown';
      const mappedRule = KNOWN_SVELTE5_RULES[code];
      if (mappedRule && !ruleEnabledForVersion(mappedRule, svelteVersion)) {
        return null;
      }

      const file = record.file ?? record.filename;
      return {
        filePath: file ? path.resolve(rootDirectory, file) : rootDirectory,
        plugin: 'svelte-check',
        rule: code,
        severity: record.severity === 'error' ? 'error' : 'warning',
        message: record.message ?? 'Unknown svelte-check issue',
        help: '',
        line: record.line ?? 0,
        column: record.column ?? 0,
        category: mappedRule?.category ?? 'correctness',
      } satisfies Diagnostic;
    })
    .filter((diagnostic): diagnostic is Diagnostic => Boolean(diagnostic));

  if (includePaths.length === 0) return diagnostics;
  const includeSet = new Set(includePaths.map((filePath) => path.resolve(filePath)));
  return diagnostics.filter((diagnostic) => includeSet.has(path.resolve(diagnostic.filePath)));
};
