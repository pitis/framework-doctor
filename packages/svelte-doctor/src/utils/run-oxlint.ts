import { spawnSync } from "node:child_process";
import path from "node:path";
import type { Diagnostic } from "../types.js";

interface OxlintSpan {
  line: number;
  column: number;
}

interface OxlintLabel {
  span: OxlintSpan;
}

interface OxlintDiagnostic {
  code: string;
  message: string;
  severity: "error" | "warning";
  filename: string;
  help?: string;
  labels?: OxlintLabel[];
}

interface OxlintObjectOutput {
  diagnostics?: OxlintDiagnostic[];
}

const JS_TS_FILE_PATTERN = /\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

const parseRuleCode = (code: string): { plugin: string; rule: string } => {
  const match = code.match(/^(.+)\((.+)\)$/);
  if (!match) return { plugin: "oxlint", rule: code };
  return { plugin: match[1].replace(/^eslint-plugin-/, ""), rule: match[2] };
};

const parseOutput = (rawOutput: string): OxlintDiagnostic[] => {
  if (!rawOutput.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    return [];
  }

  if (Array.isArray(parsed)) {
    return parsed as OxlintDiagnostic[];
  }

  if (parsed && typeof parsed === "object" && "diagnostics" in parsed) {
    return ((parsed as OxlintObjectOutput).diagnostics ?? []) as OxlintDiagnostic[];
  }

  return [];
};

export const runOxlint = async (
  rootDirectory: string,
  hasTypeScript: boolean,
  includePaths: string[],
): Promise<Diagnostic[]> => {
  const selectedPaths =
    includePaths.length > 0
      ? includePaths.filter((filePath) => JS_TS_FILE_PATTERN.test(filePath))
      : ["."];

  if (selectedPaths.length === 0) return [];

  const args = ["oxlint", "--format", "json"];
  if (hasTypeScript) {
    args.push("--tsconfig", "./tsconfig.json");
  }
  args.push(...selectedPaths);

  const result = spawnSync("pnpm", args, {
    cwd: rootDirectory,
    encoding: "utf-8",
    shell: process.platform === "win32",
  });

  const diagnostics = parseOutput(result.stdout);
  return diagnostics
    .filter((diagnostic) => JS_TS_FILE_PATTERN.test(diagnostic.filename))
    .map((diagnostic) => {
      const { plugin, rule } = parseRuleCode(diagnostic.code ?? "oxlint/unknown");
      const primaryLabel = diagnostic.labels?.[0];
      return {
        filePath: path.resolve(rootDirectory, diagnostic.filename),
        plugin,
        rule,
        severity: diagnostic.severity === "error" ? "error" : "warning",
        message: diagnostic.message,
        help: diagnostic.help ?? "",
        line: primaryLabel?.span.line ?? 0,
        column: primaryLabel?.span.column ?? 0,
        category: "correctness",
      } satisfies Diagnostic;
    });
};
