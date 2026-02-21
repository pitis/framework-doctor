import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Diagnostic } from '../types.js';

/** Match {@html ...} - raw HTML injection (XSS risk) */
const AT_HTML_REGEX = /\{@html\s+/g;

/** Match new Function(...) - code injection */
const NEW_FUNCTION_REGEX = /\bnew\s+Function\s*\(/g;

/** Match setTimeout("..." or setTimeout('... - implied eval */
const SET_TIMEOUT_STRING_REGEX = /\bsetTimeout\s*\(\s*["']/g;

/** Match setInterval("..." or setInterval('... - implied eval */
const SET_INTERVAL_STRING_REGEX = /\bsetInterval\s*\(\s*["']/g;

const findMatches = (content: string, regex: RegExp): Array<{ line: number; column: number }> => {
  const results: Array<{ line: number; column: number }> = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(line)) !== null) {
      results.push({ line: i + 1, column: match.index });
    }
  }
  return results;
};

const scanFile = (filePath: string, content: string, rootDirectory: string): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const plugin = 'svelte-doctor';

  if (filePath.endsWith('.svelte')) {
    const matches = findMatches(content, AT_HTML_REGEX);
    for (const { line, column } of matches) {
      diagnostics.push({
        filePath,
        plugin,
        rule: 'no-at-html',
        severity: 'error',
        message: 'Raw HTML via {@html} can lead to XSS if content is unsanitized.',
        help: 'Sanitize user-controlled content (e.g. with DOMPurify) or avoid {@html} for untrusted input.',
        line,
        column,
        category: 'security',
      });
    }
  }

  if (
    filePath.endsWith('.ts') ||
    filePath.endsWith('.tsx') ||
    filePath.endsWith('.js') ||
    filePath.endsWith('.jsx') ||
    filePath.endsWith('.mts') ||
    filePath.endsWith('.cts') ||
    filePath.endsWith('.mjs') ||
    filePath.endsWith('.cjs')
  ) {
    const newFnMatches = findMatches(content, NEW_FUNCTION_REGEX);
    for (const { line, column } of newFnMatches) {
      diagnostics.push({
        filePath,
        plugin,
        rule: 'no-new-function',
        severity: 'error',
        message: 'new Function() can execute arbitrary code (code injection risk).',
        help: 'Avoid dynamic code evaluation. Use static functions or safe alternatives.',
        line,
        column,
        category: 'security',
      });
    }

    const setTimeoutMatches = findMatches(content, SET_TIMEOUT_STRING_REGEX);
    for (const { line, column } of setTimeoutMatches) {
      diagnostics.push({
        filePath,
        plugin,
        rule: 'no-implied-eval',
        severity: 'error',
        message: 'setTimeout with string argument executes code (implied eval).',
        help: 'Use a function callback instead: setTimeout(() => { ... }, delay).',
        line,
        column,
        category: 'security',
      });
    }

    const setIntervalMatches = findMatches(content, SET_INTERVAL_STRING_REGEX);
    for (const { line, column } of setIntervalMatches) {
      diagnostics.push({
        filePath,
        plugin,
        rule: 'no-implied-eval',
        severity: 'error',
        message: 'setInterval with string argument executes code (implied eval).',
        help: 'Use a function callback instead: setInterval(() => { ... }, delay).',
        line,
        column,
        category: 'security',
      });
    }
  }

  return diagnostics;
};

const getFilesToScan = (rootDirectory: string, includePaths: string[]): string[] => {
  if (includePaths.length > 0) {
    return includePaths
      .map((p) => path.resolve(rootDirectory, p))
      .filter((filePath) => {
        const rel = path.relative(rootDirectory, filePath);
        return (
          !rel.startsWith('..') &&
          (filePath.endsWith('.svelte') || /\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/.test(filePath))
        );
      });
  }

  const gitResult = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: rootDirectory,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (gitResult.status === 0 && !gitResult.error) {
    return gitResult.stdout
      .split('\n')
      .map((p) => p.trim())
      .filter(
        (p) =>
          p.length > 0 && (p.endsWith('.svelte') || /\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/.test(p)),
      )
      .map((p) => path.resolve(rootDirectory, p));
  }

  const files: string[] = [];
  const walk = (dir: string): void => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
          walk(fullPath);
        }
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.svelte') || /\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/.test(entry.name))
      ) {
        files.push(fullPath);
      }
    }
  };

  const srcPath = path.join(rootDirectory, 'src');
  if (fs.existsSync(srcPath)) {
    walk(srcPath);
  }
  walk(rootDirectory);
  return [...new Set(files)].filter((f) => !f.includes('node_modules'));
};

export const runSecurityScan = async (
  rootDirectory: string,
  includePaths: string[],
): Promise<Diagnostic[]> => {
  const files = getFilesToScan(rootDirectory, includePaths);
  const diagnostics: Diagnostic[] = [];

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      diagnostics.push(...scanFile(filePath, content, rootDirectory));
    } catch {
      // Skip unreadable files
    }
  }

  return diagnostics;
};
