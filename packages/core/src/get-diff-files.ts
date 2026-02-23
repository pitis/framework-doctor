import { execSync } from 'node:child_process';
import type { DiffInfo } from './types.js';

const DEFAULT_BRANCH_CANDIDATES = ['main', 'master'];

const getCurrentBranch = (directory: string): string | null => {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: directory,
      stdio: 'pipe',
    })
      .toString()
      .trim();
    return branch === 'HEAD' ? null : branch;
  } catch {
    return null;
  }
};

const detectDefaultBranch = (directory: string): string | null => {
  try {
    const reference = execSync('git symbolic-ref refs/remotes/origin/HEAD', {
      cwd: directory,
      stdio: 'pipe',
    })
      .toString()
      .trim();
    return reference.replace('refs/remotes/origin/', '');
  } catch {
    for (const candidate of DEFAULT_BRANCH_CANDIDATES) {
      try {
        execSync(`git rev-parse --verify ${candidate}`, {
          cwd: directory,
          stdio: 'pipe',
        });
        return candidate;
      } catch {
        // try next candidate
      }
    }
    return null;
  }
};

const getChangedFilesSinceBranch = (directory: string, baseBranch: string): string[] => {
  try {
    const mergeBase = execSync(`git merge-base ${baseBranch} HEAD`, {
      cwd: directory,
      stdio: 'pipe',
    })
      .toString()
      .trim();

    const output = execSync(`git diff --name-only --diff-filter=ACMR --relative ${mergeBase}`, {
      cwd: directory,
      stdio: 'pipe',
    })
      .toString()
      .trim();

    if (!output) return [];
    return output.split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

const getUncommittedChangedFiles = (directory: string): string[] => {
  try {
    const output = execSync('git diff --name-only --diff-filter=ACMR --relative HEAD', {
      cwd: directory,
      stdio: 'pipe',
    })
      .toString()
      .trim();
    if (!output) return [];
    return output.split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

export const getDiffInfo = (directory: string, explicitBaseBranch?: string): DiffInfo | null => {
  const currentBranch = getCurrentBranch(directory);
  if (!currentBranch) return null;

  const baseBranch = explicitBaseBranch ?? detectDefaultBranch(directory);
  if (!baseBranch) return null;

  if (currentBranch === baseBranch) {
    const uncommittedFiles = getUncommittedChangedFiles(directory);
    if (uncommittedFiles.length === 0) return null;
    return {
      currentBranch,
      baseBranch,
      changedFiles: uncommittedFiles,
      isCurrentChanges: true,
    };
  }

  const changedFiles = getChangedFilesSinceBranch(directory, baseBranch);
  return { currentBranch, baseBranch, changedFiles };
};

export const SOURCE_FILE_PATTERN_JS_TS = /\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

export const SOURCE_FILE_PATTERN_SVELTE = /\.(svelte|ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

export const SOURCE_FILE_PATTERN_REACT = /\.(tsx?|jsx?)$/;

export const SOURCE_FILE_PATTERN_VUE = /\.(vue|ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

export const filterSourceFiles = (
  filePaths: string[],
  pattern: RegExp = SOURCE_FILE_PATTERN_JS_TS,
): string[] => filePaths.filter((filePath) => pattern.test(filePath));
