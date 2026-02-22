import {
  addAnalyticsOption,
  buildCountsSummaryLine,
  buildScoreBar,
  colorizeByScore,
  createFramedLine,
  getDoctorFace,
  groupBy,
  highlighter,
  indentMultilineText,
  isAutomatedEnvironment,
  logger,
  PERFECT_SCORE,
  printFramedBox,
  spinner,
} from '@framework-doctor/core';
import { Command } from 'commander';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import type { Diagnostic, ScanOptions, SvelteDoctorConfig } from './types.js';
import { discoverProject } from './utils/discover-project.js';
import { filterIgnoredDiagnostics } from './utils/filter-diagnostics.js';
import { filterSourceFiles, getDiffInfo } from './utils/get-diff-files.js';
import { loadConfig } from './utils/load-config.js';
import { runKnip } from './utils/run-knip.js';
import { runOxlint } from './utils/run-oxlint.js';
import { runSecurityScan } from './utils/run-security-scan.js';
import { runSvelteCheck } from './utils/run-svelte-check.js';
import { calculateScore } from './utils/score.js';
import {
  maybePromptAnalyticsConsent,
  sendScanEvent,
  shouldSendAnalytics,
} from './utils/telemetry.js';

const VERSION = process.env.VERSION ?? '0.0.0';

interface CliFlags {
  lint: boolean;
  jsTsLint: boolean;
  deadCode: boolean;
  verbose: boolean;
  score: boolean;
  yes: boolean;
  analytics: boolean;
  project?: string;
  diff?: boolean | string;
  offline?: boolean;
}

const SEVERITY_ORDER: Record<Diagnostic['severity'], number> = {
  error: 0,
  warning: 1,
};

const colorizeBySeverity = (text: string, severity: Diagnostic['severity']): string =>
  severity === 'error' ? highlighter.error(text) : highlighter.warn(text);

const sortBySeverity = (groups: [string, Diagnostic[]][]): [string, Diagnostic[]][] =>
  groups.toSorted(([, a], [, b]) => SEVERITY_ORDER[a[0].severity] - SEVERITY_ORDER[b[0].severity]);

const buildFileLineMap = (diagnostics: Diagnostic[]): Map<string, number[]> => {
  const map = new Map<string, number[]>();
  for (const d of diagnostics) {
    const lines = map.get(d.filePath) ?? [];
    if (d.line > 0) lines.push(d.line);
    map.set(d.filePath, lines);
  }
  return map;
};

const printRuleGroup = (ruleDiagnostics: Diagnostic[], verbose: boolean): void => {
  const first = ruleDiagnostics[0];
  const icon = colorizeBySeverity(first.severity === 'error' ? '✗' : '⚠', first.severity);
  const count = ruleDiagnostics.length;
  const countLabel = count > 1 ? colorizeBySeverity(` (${count})`, first.severity) : '';

  logger.log(`  ${icon} ${first.message}${countLabel}`);
  if (first.help) {
    logger.dim(indentMultilineText(first.help, '    '));
  }
  if (verbose) {
    const fileLines = buildFileLineMap(ruleDiagnostics);
    for (const [filePath, lines] of fileLines) {
      const lineLabel = lines.length > 0 ? `: ${lines.join(', ')}` : '';
      logger.dim(`    ${filePath}${lineLabel}`);
    }
  }
  logger.break();
};

const printDiagnostics = (diagnostics: Diagnostic[], verbose: boolean): void => {
  const ruleGroups = groupBy(diagnostics, (d) => `${d.plugin}/${d.rule}`);
  const sortedGroups = sortBySeverity([...ruleGroups.entries()]);

  for (const [, ruleDiagnostics] of sortedGroups) {
    printRuleGroup(ruleDiagnostics, verbose);
  }
};

const printSummary = (
  score: number,
  label: string,
  diagnostics: Diagnostic[],
  totalSourceFileCount: number,
  elapsedMs: number,
): void => {
  const [eyes, mouth] = getDoctorFace(score);
  const colorize = (text: string) => colorizeByScore(text, score);
  const bar = buildScoreBar(score);
  const counts = buildCountsSummaryLine(diagnostics, totalSourceFileCount, elapsedMs);

  printFramedBox([
    createFramedLine('┌─────┐', colorize('┌─────┐')),
    createFramedLine(`│ ${eyes} │`, colorize(`│ ${eyes} │`)),
    createFramedLine(`│ ${mouth} │`, colorize(`│ ${mouth} │`)),
    createFramedLine('└─────┘', colorize('└─────┘')),
    createFramedLine('Svelte Doctor (local)', `Svelte Doctor ${highlighter.dim('(local)')}`),
    createFramedLine(''),
    createFramedLine(
      `${score} / ${PERFECT_SCORE}  ${label}`,
      `${colorize(String(score))} / ${PERFECT_SCORE}  ${colorize(label)}`,
    ),
    createFramedLine(''),
    createFramedLine(bar.plain, bar.rendered),
    createFramedLine(''),
    createFramedLine(counts.plain, counts.rendered),
  ]);
};

const applyDiffMode = (rootDirectory: string, flags: CliFlags, scanOptions: ScanOptions): void => {
  if (flags.diff === undefined || flags.diff === false) return;
  const base = typeof flags.diff === 'string' ? flags.diff : 'main';
  const diff = getDiffInfo(rootDirectory, base);
  if (!diff) return;
  scanOptions.includePaths = filterSourceFiles(diff.changedFiles);
};

const printDetection = (
  frameworkLabel: string,
  svelteVersion: string,
  languageLabel: string,
  sourceFileCount: number,
  changedFileCount: number | undefined,
  hasConfig: boolean,
): void => {
  spinner('Detecting framework...')
    .start()
    .succeed(`Detecting framework. Found ${highlighter.info(frameworkLabel)}.`);

  const versionLabel = `Svelte ${svelteVersion}`;
  spinner('Detecting Svelte version...')
    .start()
    .succeed(`Detecting Svelte version. Found ${highlighter.info(versionLabel)}.`);

  spinner('Detecting language...')
    .start()
    .succeed(`Detecting language. Found ${highlighter.info(languageLabel)}.`);

  if (typeof changedFileCount === 'number') {
    spinner('Detecting scan scope...')
      .start()
      .succeed(`Scanning ${highlighter.info(String(changedFileCount))} changed source files.`);
  } else {
    spinner('Counting source files...')
      .start()
      .succeed(`Found ${highlighter.info(String(sourceFileCount))} source files.`);
  }

  if (hasConfig) {
    spinner('Loading config...')
      .start()
      .succeed(`Loaded ${highlighter.info('svelte-doctor config')}.`);
  }

  logger.break();
};

const runNonFatal = async (
  startText: string,
  successText: string,
  failText: string,
  fn: () => Promise<Diagnostic[]>,
): Promise<Diagnostic[]> => {
  const s = spinner(startText).start();
  try {
    const diagnostics = await fn();
    s.succeed(successText);
    return diagnostics;
  } catch (error) {
    s.fail(failText);
    logger.dim(String(error));
    return [];
  }
};

const resolveScanOptions = (
  flags: CliFlags,
  config: SvelteDoctorConfig | null,
  program: Command,
): ScanOptions => {
  const fromCli = (key: string): boolean => program.getOptionValueSource(key) === 'cli';
  return {
    lint: fromCli('lint') ? flags.lint : (config?.lint ?? flags.lint),
    jsTsLint: fromCli('jsTsLint') ? flags.jsTsLint : (config?.jsTsLint ?? flags.jsTsLint),
    deadCode: fromCli('deadCode') ? flags.deadCode : (config?.deadCode ?? flags.deadCode),
    verbose: fromCli('verbose') ? flags.verbose : (config?.verbose ?? flags.verbose),
  };
};

const main = new Command()
  .name('svelte-doctor')
  .description('Diagnose Svelte codebase health')
  .version(VERSION, '-v, --version', 'display the version number')
  .argument('[directory]', 'project directory to scan', '.')
  .option('--no-lint', 'skip lint diagnostics')
  .option('--no-js-ts-lint', 'skip JavaScript/TypeScript lint diagnostics')
  .option('--no-dead-code', 'skip dead code detection')
  .option('--verbose', 'show file details per rule')
  .option('--score', 'output only the score')
  .option('-y, --yes', 'skip prompts');

addAnalyticsOption(main);

main
  .option('--project <name>', 'select workspace project (comma-separated)')
  .option('--diff [base]', 'scan only files changed vs base branch')
  .option('--offline', 'skip remote scoring (local score only)')
  .action(async (directory: string, flags: CliFlags) => {
    const startTime = performance.now();
    const resolvedDirectory = path.resolve(directory);
    const config = loadConfig(resolvedDirectory);
    const scanOptions = resolveScanOptions(flags, config, main);

    const isScoreOnly = flags.score;
    const isAutomated = isAutomatedEnvironment();
    const shouldSkipPrompts = flags.yes || isAutomated || !process.stdin.isTTY;

    logger.log(`svelte-doctor v${VERSION}`);
    logger.break();

    if (!isScoreOnly && !isAutomated && !flags.yes) {
      await maybePromptAnalyticsConsent(shouldSkipPrompts);
    }

    applyDiffMode(resolvedDirectory, flags, scanOptions);

    const projectInfo = discoverProject(resolvedDirectory);
    if (!projectInfo.svelteVersion) {
      throw new Error('No Svelte dependency found in package.json');
    }

    const languageLabel = projectInfo.hasTypeScript ? 'TypeScript' : 'JavaScript';
    const frameworkLabel = projectInfo.framework === 'sveltekit' ? 'SvelteKit' : 'Svelte';

    const includePaths = scanOptions.includePaths ?? [];
    const changedCount = includePaths.length > 0 ? includePaths.length : undefined;
    printDetection(
      frameworkLabel,
      projectInfo.svelteVersion,
      languageLabel,
      projectInfo.sourceFileCount,
      changedCount,
      Boolean(config),
    );

    const sveltePromise = scanOptions.lint
      ? runNonFatal(
          'Running Svelte checks...',
          'Running Svelte checks.',
          'Svelte checks failed (non-fatal, skipping).',
          () => runSvelteCheck(resolvedDirectory, includePaths, projectInfo.svelteVersion ?? ''),
        )
      : Promise.resolve([]);

    const jsTsPromise = scanOptions.jsTsLint
      ? runNonFatal(
          'Running JS/TS lint...',
          'Running JS/TS lint.',
          'JS/TS lint failed (non-fatal, skipping).',
          () => runOxlint(resolvedDirectory, projectInfo.hasTypeScript, includePaths),
        )
      : Promise.resolve([]);

    const securityPromise = scanOptions.lint
      ? runNonFatal(
          'Running security checks...',
          'Running security checks.',
          'Security checks failed (non-fatal, skipping).',
          () => runSecurityScan(resolvedDirectory, includePaths),
        )
      : Promise.resolve([]);

    const deadCodePromise =
      scanOptions.deadCode && includePaths.length === 0
        ? runNonFatal(
            'Detecting dead code...',
            'Detecting dead code.',
            'Dead code detection failed (non-fatal, skipping).',
            () => runKnip(resolvedDirectory),
          )
        : Promise.resolve([]);

    const [svelteDiagnostics, jsTsDiagnostics, securityDiagnostics, deadCodeDiagnostics] =
      await Promise.all([sveltePromise, jsTsPromise, securityPromise, deadCodePromise]);

    const diagnostics = filterIgnoredDiagnostics(
      [...svelteDiagnostics, ...jsTsDiagnostics, ...securityDiagnostics, ...deadCodeDiagnostics],
      config,
    );

    const scoreResult = calculateScore(diagnostics);

    const telemetryUrl = process.env.FRAMEWORK_DOCTOR_TELEMETRY_URL ?? '';
    const isDiffMode = (scanOptions.includePaths?.length ?? 0) > 0;
    if (
      telemetryUrl &&
      shouldSendAnalytics(
        { analytics: flags.analytics, yes: flags.yes },
        config?.analytics,
        isAutomated,
      )
    ) {
      sendScanEvent(telemetryUrl, projectInfo, scoreResult, diagnostics.length, {
        isDiffMode,
        cliVersion: VERSION,
      });
    }

    if (flags.score) {
      logger.log(`${scoreResult.score}`);
      return;
    }

    const elapsedMs = performance.now() - startTime;
    const hasIncludePaths = (scanOptions.includePaths?.length ?? 0) > 0;
    const totalSourceFileCount = hasIncludePaths
      ? scanOptions.includePaths!.length
      : projectInfo.sourceFileCount;

    if (diagnostics.length === 0) {
      logger.success('No issues found!');
    } else {
      printDiagnostics(diagnostics, Boolean(scanOptions.verbose));
    }

    logger.break();
    printSummary(
      scoreResult.score,
      scoreResult.label,
      diagnostics,
      totalSourceFileCount,
      elapsedMs,
    );
  });

await main.parseAsync();
