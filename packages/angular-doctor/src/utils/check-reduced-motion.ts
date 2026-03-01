import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ANGULAR_MOTION_LIBRARIES } from '../constants.js';
import type { Diagnostic } from '../types.js';
import { readPackageJson } from './read-package-json.js';

const REDUCED_MOTION_GREP_PATTERN = 'prefers-reduced-motion|useReducedMotion';
const REDUCED_MOTION_FILE_GLOBS = [
  '*.html',
  '*.ts',
  '*.tsx',
  '*.js',
  '*.jsx',
  '*.css',
  '*.scss',
] as const;

const MISSING_REDUCED_MOTION_DIAGNOSTIC: Diagnostic = {
  filePath: 'package.json',
  plugin: 'angular-doctor',
  rule: 'require-reduced-motion',
  severity: 'error',
  message:
    'Project uses a motion library but has no prefers-reduced-motion handling — required for accessibility (WCAG 2.3.3)',
  help: 'Add `useReducedMotion()` from your animation library, or a `@media (prefers-reduced-motion: reduce)` CSS query',
  line: 0,
  column: 0,
  category: 'Accessibility',
};

export const checkReducedMotion = (rootDirectory: string): Diagnostic[] => {
  const packageJsonPath = path.join(rootDirectory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return [];

  let hasMotionLibrary = false;
  try {
    const packageJson = readPackageJson(packageJsonPath);
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    hasMotionLibrary = Object.keys(allDependencies).some((packageName) =>
      ANGULAR_MOTION_LIBRARIES.has(packageName),
    );
  } catch {
    return [];
  }
  if (!hasMotionLibrary) return [];

  try {
    const result = spawnSync(
      'git',
      ['grep', '-ql', '-E', REDUCED_MOTION_GREP_PATTERN, '--', ...REDUCED_MOTION_FILE_GLOBS],
      { cwd: rootDirectory, encoding: 'utf-8', stdio: 'pipe' },
    );
    if (result.status === 0 && !result.error) return [];
    return [MISSING_REDUCED_MOTION_DIAGNOSTIC];
  } catch {
    return [MISSING_REDUCED_MOTION_DIAGNOSTIC];
  }
};
