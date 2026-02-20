import path from "node:path";
import { spawnSync } from "node:child_process";
import type { Diagnostic } from "../types.js";
import { ruleEnabledForVersion } from "./version-rules.js";

interface SvelteCheckRecord {
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  message?: string;
  severity?: "error" | "warning";
}

const KNOWN_SVELTE5_RULES: Record<string, { minVersion: string; category: Diagnostic["category"] }> = {
  "a11y-missing-attribute": { minVersion: "5.0.0", category: "accessibility" },
  "css-unused-selector": { minVersion: "5.0.0", category: "maintainability" },
};

const parseLines = (rawOutput: string): SvelteCheckRecord[] =>
  rawOutput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{") && line.endsWith("}"))
    .map((line) => {
      try {
        return JSON.parse(line) as SvelteCheckRecord;
      } catch {
        return {};
      }
    });

export const runSvelteCheck = async (
  rootDirectory: string,
  includePaths: string[],
  svelteVersion: string,
): Promise<Diagnostic[]> => {
  const args = ["svelte-check", "--output", "machine"];

  const result = spawnSync("pnpm", args, {
    cwd: rootDirectory,
    encoding: "utf-8",
    shell: process.platform === "win32",
  });

  const records = parseLines(`${result.stdout}\n${result.stderr}`);
  const diagnostics = records
    .filter((record) => Boolean(record.file) && Boolean(record.message))
    .map((record) => {
      const code = record.code ?? "unknown";
      const mappedRule = KNOWN_SVELTE5_RULES[code];
      if (mappedRule && !ruleEnabledForVersion(mappedRule, svelteVersion)) {
        return null;
      }

      return {
        filePath: record.file ? path.resolve(rootDirectory, record.file) : rootDirectory,
        plugin: "svelte-check",
        rule: code,
        severity: record.severity === "error" ? "error" : "warning",
        message: record.message ?? "Unknown svelte-check issue",
        help: "",
        line: record.line ?? 0,
        column: record.column ?? 0,
        category: mappedRule?.category ?? "correctness",
      } satisfies Diagnostic;
    })
    .filter((diagnostic): diagnostic is Diagnostic => Boolean(diagnostic));

  if (includePaths.length === 0) return diagnostics;
  const includeSet = new Set(includePaths.map((filePath) => path.resolve(filePath)));
  return diagnostics.filter((diagnostic) => includeSet.has(path.resolve(diagnostic.filePath)));
};
