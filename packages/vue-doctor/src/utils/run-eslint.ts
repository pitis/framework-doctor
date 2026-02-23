import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Diagnostic, VueFramework } from '../types.js';

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

const createEslintConfigContent = (hasNuxt: boolean): string => {
  let content = `const pluginVue = require('eslint-plugin-vue');
const pluginVuejsAccessibility = require('eslint-plugin-vuejs-accessibility');

const config = [
  ...pluginVue.configs['flat/recommended'],
  ...pluginVuejsAccessibility.configs['flat/recommended'],
  {
    files: ['**/*.vue', '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', extraFileExtensions: ['.vue'] },
      globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly', __dirname: 'readonly', __filename: 'readonly', module: 'readonly', require: 'readonly', exports: 'writable' },
    },
  },
`;

  if (hasNuxt) {
    content += `  { plugins: { nuxt: require('@nuxt/eslint-plugin') }, rules: { 'nuxt/prefer-import-meta': 'warn' } },
`;
  }

  content += `];
module.exports = config;
`;
  return content;
};

export const runEslint = async (
  rootDirectory: string,
  framework: VueFramework,
  includePaths: string[],
): Promise<Diagnostic[]> => {
  const hasNuxt = framework === 'nuxt';
  const tempDir = mkdtempSync(path.join(tmpdir(), 'vue-doctor-eslint-'));
  const configPath = path.join(tempDir, 'eslint.config.cjs');

  try {
    const configContent = createEslintConfigContent(hasNuxt);
    writeFileSync(configPath, configContent, 'utf-8');

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
