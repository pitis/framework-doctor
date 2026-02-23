import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Diagnostic } from '../types.js';

const TSC_OUTPUT_REGEX = /^(.+?)\((\d+),(\d+)\): (error|warning) (TS\d+): (.+)$/m;

const parseOutput = (output: string, rootDirectory: string): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.trim().match(TSC_OUTPUT_REGEX);
    if (!match) continue;

    const [, filePath, lineStr, colStr, severity, rule, message] = match;
    const resolvedPath = path.isAbsolute(filePath ?? '')
      ? (filePath as string)
      : path.resolve(rootDirectory, filePath ?? '');

    diagnostics.push({
      filePath: resolvedPath,
      plugin: 'vue-tsc',
      rule: rule ?? 'unknown',
      severity: severity === 'error' ? 'error' : 'warning',
      message: message ?? 'Unknown vue-tsc issue',
      help: '',
      line: parseInt(lineStr ?? '0', 10),
      column: parseInt(colStr ?? '0', 10),
      category: 'correctness',
    });
  }

  return diagnostics;
};

export const runVueTsc = async (
  rootDirectory: string,
  includePaths: string[],
): Promise<Diagnostic[]> => {
  const require = createRequire(import.meta.url);
  const vueTscBin = require.resolve('vue-tsc/bin/vue-tsc.js');

  const result = spawnSync(process.execPath, [vueTscBin, '--noEmit'], {
    cwd: rootDirectory,
    encoding: 'utf-8',
  });

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  const diagnostics = parseOutput(output, rootDirectory);

  if (includePaths.length > 0) {
    const includeSet = new Set(
      includePaths.map((filePath) => path.resolve(rootDirectory, filePath)),
    );
    return diagnostics.filter((diagnostic) => includeSet.has(diagnostic.filePath));
  }

  return diagnostics;
};
