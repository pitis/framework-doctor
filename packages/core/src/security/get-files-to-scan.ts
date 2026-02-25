import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { GIT_LS_FILES_MAX_BUFFER_BYTES } from '../constants.js';
export const SOURCE_FILE_PATTERN_FULL = /\.(svelte|ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

export const SOURCE_FILE_PATTERN_WITH_VUE = /\.(vue|svelte|ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

export const SOURCE_FILE_PATTERN_WITH_ANGULAR = /\.(html|ts|mts|cts|mjs|cjs)$/;

export const getFilesToScan = (
  rootDirectory: string,
  includePaths: string[],
  pattern: RegExp = SOURCE_FILE_PATTERN_FULL,
): string[] => {
  if (includePaths.length > 0) {
    return includePaths
      .map((filePath) => path.resolve(rootDirectory, filePath))
      .filter((resolvedPath) => {
        const relative = path.relative(rootDirectory, resolvedPath);
        return !relative.startsWith('..') && pattern.test(resolvedPath);
      });
  }

  const gitResult = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: rootDirectory,
    encoding: 'utf-8',
    maxBuffer: GIT_LS_FILES_MAX_BUFFER_BYTES,
  });

  if (gitResult.status === 0 && !gitResult.error) {
    return gitResult.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && pattern.test(line))
      .map((line) => path.resolve(rootDirectory, line));
  }

  const collectedFiles: string[] = [];
  const walk = (dir: string): void => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
          walk(fullPath);
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        collectedFiles.push(fullPath);
      }
    }
  };

  const srcPath = path.join(rootDirectory, 'src');
  if (fs.existsSync(srcPath)) {
    walk(srcPath);
  }
  walk(rootDirectory);
  return [...new Set(collectedFiles)].filter((filePath) => !filePath.includes('node_modules'));
};
