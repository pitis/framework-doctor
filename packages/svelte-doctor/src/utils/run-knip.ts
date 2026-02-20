import path from "node:path";
import { spawnSync } from "node:child_process";
import type { Diagnostic } from "../types.js";

interface KnipJsonOutput {
  files?: Array<{ file: string }>;
  exports?: Array<{ file: string; symbol: string }>;
  types?: Array<{ file: string; symbol: string }>;
}

const asDiagnostics = (
  issues: Array<{ file: string; message: string; rule: string }>,
  rootDirectory: string,
): Diagnostic[] =>
  issues.map((issue) => ({
    filePath: path.resolve(rootDirectory, issue.file),
    plugin: "knip",
    rule: issue.rule,
    severity: "warning",
    message: issue.message,
    help: "Remove dead code or keep it in an explicit public API boundary.",
    line: 0,
    column: 0,
    category: "maintainability",
  }));

export const runKnip = async (rootDirectory: string): Promise<Diagnostic[]> => {
  const run = spawnSync("pnpm", ["knip", "--reporter", "json"], {
    cwd: rootDirectory,
    encoding: "utf-8",
    shell: process.platform === "win32",
  });

  const stdout = run.stdout.trim();
  if (!stdout) return [];

  let payload: KnipJsonOutput | null = null;
  try {
    payload = JSON.parse(stdout) as KnipJsonOutput;
  } catch {
    return [];
  }

  const issues: Array<{ file: string; message: string; rule: string }> = [];
  for (const file of payload.files ?? []) {
    issues.push({ file: file.file, message: "Unused file", rule: "files" });
  }
  for (const exp of payload.exports ?? []) {
    issues.push({ file: exp.file, message: `Unused export: ${exp.symbol}`, rule: "exports" });
  }
  for (const type of payload.types ?? []) {
    issues.push({ file: type.file, message: `Unused type: ${type.symbol}`, rule: "types" });
  }

  return asDiagnostics(issues, rootDirectory);
};
