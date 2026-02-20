import { spawnSync } from "node:child_process";
import path from "node:path";

export interface DiffInfo {
  baseBranch: string;
  changedFiles: string[];
}

const runGit = (cwd: string, args: string[]): string | null => {
  const result = spawnSync("git", args, { cwd, encoding: "utf-8" });
  if (result.status !== 0 || result.error) return null;
  return result.stdout.trim();
};

export const getDiffInfo = (rootDirectory: string, base = "main"): DiffInfo | null => {
  const insideWorkTree = runGit(rootDirectory, ["rev-parse", "--is-inside-work-tree"]);
  if (insideWorkTree !== "true") return null;

  const branchDiff = runGit(rootDirectory, ["diff", "--name-only", `${base}...HEAD`]);
  if (branchDiff === null) return null;

  const changedFiles = branchDiff
    .split("\n")
    .map((filePath) => filePath.trim())
    .filter(Boolean)
    .map((filePath) => path.resolve(rootDirectory, filePath));

  return { baseBranch: base, changedFiles };
};

export const filterSourceFiles = (files: string[]): string[] =>
  files.filter((filePath) => /\.(svelte|ts|tsx|js|jsx|mjs|cjs)$/.test(filePath));
