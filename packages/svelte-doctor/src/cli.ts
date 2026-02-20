import path from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import type { Diagnostic, ScanOptions, SvelteDoctorConfig } from "./types.js";
import { scan } from "./scan.js";
import { filterSourceFiles, getDiffInfo } from "./utils/get-diff-files.js";
import { loadConfig } from "./utils/load-config.js";

const VERSION = process.env.VERSION ?? "0.0.0";

interface CliFlags {
  lint: boolean;
  jsTsLint: boolean;
  deadCode: boolean;
  verbose: boolean;
  score: boolean;
  yes: boolean;
  project?: string;
  diff?: boolean | string;
  offline?: boolean;
}

const printDiagnostics = (diagnostics: Diagnostic[], verbose: boolean): void => {
  for (const diagnostic of diagnostics) {
    const icon = diagnostic.severity === "error" ? pc.red("✗") : pc.yellow("⚠");
    const rule = `${diagnostic.plugin}/${diagnostic.rule}`;
    console.log(`  ${icon} ${diagnostic.message} ${pc.dim(`(${rule})`)}`);
    if (verbose) {
      const location = diagnostic.line > 0 ? `:${diagnostic.line}:${diagnostic.column}` : "";
      console.log(pc.dim(`    ${diagnostic.filePath}${location}`));
    }
  }
};

const resolveScanOptions = (
  flags: CliFlags,
  config: SvelteDoctorConfig | null,
  program: Command,
): ScanOptions => {
  const fromCli = (key: string): boolean => program.getOptionValueSource(key) === "cli";
  return {
    lint: fromCli("lint") ? flags.lint : (config?.lint ?? flags.lint),
    jsTsLint: fromCli("jsTsLint") ? flags.jsTsLint : (config?.jsTsLint ?? flags.jsTsLint),
    deadCode: fromCli("deadCode") ? flags.deadCode : (config?.deadCode ?? flags.deadCode),
    verbose: fromCli("verbose") ? flags.verbose : (config?.verbose ?? flags.verbose),
  };
};

const main = new Command()
  .name("svelte-doctor")
  .description("Diagnose Svelte codebase health")
  .version(VERSION, "-v, --version", "display the version number")
  .argument("[directory]", "project directory to scan", ".")
  .option("--no-lint", "skip lint diagnostics")
  .option("--no-js-ts-lint", "skip JavaScript/TypeScript lint diagnostics")
  .option("--no-dead-code", "skip dead code detection")
  .option("--verbose", "show file details per rule")
  .option("--score", "output only the score")
  .option("-y, --yes", "skip prompts")
  .option("--project <name>", "select workspace project (comma-separated)")
  .option("--diff [base]", "scan only files changed vs base branch")
  .option("--offline", "skip remote scoring (local score only)")
  .action(async (directory: string, flags: CliFlags) => {
    const resolvedDirectory = path.resolve(directory);
    const config = loadConfig(resolvedDirectory);
    const scanOptions = resolveScanOptions(flags, config, main);

    if (flags.project) {
      console.log(pc.dim(`Project selection provided: ${flags.project}`));
    }

    if (flags.diff !== undefined && flags.diff !== false) {
      const base = typeof flags.diff === "string" ? flags.diff : "main";
      const diff = getDiffInfo(resolvedDirectory, base);
      if (diff) {
        scanOptions.includePaths = filterSourceFiles(diff.changedFiles);
      }
    }

    const result = await scan(resolvedDirectory, scanOptions);

    if (flags.score) {
      console.log(`${result.scoreResult.score}`);
      return;
    }

    if (result.diagnostics.length === 0) {
      console.log(pc.green("No issues found."));
    } else {
      printDiagnostics(result.diagnostics, Boolean(scanOptions.verbose));
    }

    console.log("");
    console.log(
      `Svelte Doctor score: ${pc.bold(String(result.scoreResult.score))}/100 (${result.scoreResult.label})`,
    );
    if (result.skippedChecks.length > 0) {
      console.log(pc.yellow(`Skipped checks: ${result.skippedChecks.join(", ")}`));
    }
  });

await main.parseAsync();
