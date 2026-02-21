import path from "node:path";
import { spawnSync } from "node:child_process";
import type { Diagnostic } from "../types.js";

interface KnipExport {
  name: string;
  line?: number;
  col?: number;
}

interface KnipIssue {
  file: string;
  exports?: KnipExport[];
  types?: KnipExport[];
  devDependencies?: Array<{ name: string }>;
}

interface KnipJsonOutput {
  files?: string[];
  issues?: KnipIssue[];
}

const asDiagnostics = (
  items: Array<{ file: string; message: string; rule: string; line?: number; column?: number }>,
  rootDirectory: string,
): Diagnostic[] =>
  items.map((item) => ({
    filePath: path.resolve(rootDirectory, item.file),
    plugin: "knip",
    rule: item.rule,
    severity: "warning",
    message: item.message,
    help: "Remove dead code or keep it in an explicit public API boundary.",
    line: item.line ?? 0,
    column: item.column ?? 0,
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

  const items: Array<{ file: string; message: string; rule: string; line?: number; column?: number }> = [];

  for (const file of payload.files ?? []) {
    items.push({ file, message: `Unused file: ${file}`, rule: "files" });
  }

  for (const issue of payload.issues ?? []) {
    const { file } = issue;
    for (const exp of issue.exports ?? []) {
      items.push({
        file,
        message: `Unused export: ${exp.name}`,
        rule: "exports",
        line: exp.line,
        column: exp.col,
      });
    }
    for (const typeItem of issue.types ?? []) {
      items.push({
        file,
        message: `Unused type: ${typeItem.name}`,
        rule: "types",
        line: typeItem.line,
        column: typeItem.col,
      });
    }
  }

  return asDiagnostics(items, rootDirectory);
};
