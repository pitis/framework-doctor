import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Diagnostic } from '../types.js';

interface LintMessage {
  ruleId: string | null;
  message: string;
  line: number;
  column: number;
  severity: number;
}

interface JsonOutput {
  filePath: string;
  messages: LintMessage[];
}

const parseLintResult = (result: JsonOutput, rootDirectory: string): Diagnostic[] =>
  result.messages.map((message) => {
    const [plugin, rule] = (message.ruleId ?? 'eslint/unknown').split('/');
    return {
      filePath: result.filePath,
      plugin,
      rule: rule ?? 'unknown',
      severity: message.severity === 2 ? 'error' : 'warning',
      message: message.message,
      help: '',
      line: message.line,
      column: message.column,
      category: 'correctness',
    };
  });

const createEslintConfigContent = (): string => `const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {},
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
`;

export const runEslint = async (
  rootDirectory: string,
  includePaths: string[],
): Promise<Diagnostic[]> => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'angular-doctor-eslint-'));
  const configPath = path.join(tempDir, 'eslint.config.cjs');

  try {
    writeFileSync(configPath, createEslintConfigContent(), 'utf-8');

    const require = createRequire(import.meta.url);
    const eslintPackagePath = require.resolve('eslint/package.json');
    const eslintDir = path.dirname(eslintPackagePath);
    const eslintBin = path.join(eslintDir, 'bin/eslint.js');

    const targetPaths = includePaths.length > 0 ? includePaths : ['.'];
    const result = spawnSync(
      process.execPath,
      [eslintBin, '--config', configPath, '--format', 'json', ...targetPaths],
      {
        cwd: rootDirectory,
        encoding: 'utf-8',
      },
    );

    const output = result.stdout?.trim() || result.stderr?.trim() || '[]';
    let results: JsonOutput[] = [];
    try {
      results = JSON.parse(output) as JsonOutput[];
    } catch {
      return [];
    }

    const diagnostics: Diagnostic[] = [];
    for (const lintResult of results) {
      if (lintResult.messages?.length > 0) {
        diagnostics.push(...parseLintResult(lintResult, rootDirectory));
      }
    }
    return diagnostics;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};
