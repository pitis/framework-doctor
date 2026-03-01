import {
  addAnalyticsOption,
  buildCountsSummaryLine,
  buildScoreBar,
  buildScoreBreakdownLines,
  calculateScore,
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
} from '@framework-doctor/core';
import { Command } from 'commander';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import prompts from 'prompts';
import { scan } from './scan.js';
import type {
  Diagnostic,
  DiffInfo,
  ScanOptions,
  ScoreResult,
  SvelteDoctorConfig,
} from './types.js';
import { filterSourceFiles, getDiffInfo } from './utils/get-diff-files.js';
import { handleError } from './utils/handle-error.js';
import { loadConfig } from './utils/load-config.js';
import { selectProjects } from './utils/select-projects.js';
import { maybePromptSkillInstall } from './utils/skill-prompt.js';
import {
  maybePromptAnalyticsConsent,
  sendScanEvent,
  shouldSendAnalytics,
} from './utils/telemetry.js';
import { writeDiagnosticsDirectory } from './utils/write-diagnostics-dir.js';

const VERSION = process.env.VERSION ?? '0.0.0';

interface CliFlags {
  lint: boolean;
  jsTsLint: boolean;
  deadCode: boolean;
  audit: boolean;
  verbose: boolean;
  score: boolean;
  yes: boolean;
  analytics: boolean;
  format: string;
  fix: boolean;
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
  for (const diagnostic of diagnostics) {
    const lines = map.get(diagnostic.filePath) ?? [];
    if (diagnostic.line > 0) lines.push(diagnostic.line);
    map.set(diagnostic.filePath, lines);
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
  const ruleGroups = groupBy(
    diagnostics,
    (diagnostic) => `${diagnostic.plugin}/${diagnostic.rule}`,
  );
  const sortedGroups = sortBySeverity([...ruleGroups.entries()]);

  for (const [, ruleDiagnostics] of sortedGroups) {
    printRuleGroup(ruleDiagnostics, verbose);
  }
};

const printSummary = (
  scoreResult: ScoreResult,
  diagnostics: Diagnostic[],
  totalSourceFileCount: number,
  elapsedMs: number,
  verbose: boolean,
): void => {
  const { score, label } = scoreResult;
  const [eyes, mouth] = getDoctorFace(score);
  const colorize = (text: string) => colorizeByScore(text, score);
  const bar = buildScoreBar(score);
  const counts = buildCountsSummaryLine(diagnostics, totalSourceFileCount, elapsedMs);

  const framedLines: ReturnType<typeof createFramedLine>[] = [
    createFramedLine('┌─────┐', colorize('┌─────┐')),
    createFramedLine(`│ ${eyes} │`, colorize(`│ ${eyes} │`)),
    createFramedLine(`│ ${mouth} │`, colorize(`│ ${mouth} │`)),
    createFramedLine('└─────┘', colorize('└─────┘')),
    createFramedLine('Svelte Doctor', 'Svelte Doctor'),
    createFramedLine(''),
    createFramedLine(
      `${score} / ${PERFECT_SCORE}  ${label}`,
      `${colorize(String(score))} / ${PERFECT_SCORE}  ${colorize(label)}`,
    ),
    createFramedLine(''),
    createFramedLine(bar.plain, bar.rendered),
  ];
  if (verbose && scoreResult.breakdown) {
    framedLines.push(createFramedLine(''));
    framedLines.push(...buildScoreBreakdownLines(scoreResult.breakdown));
  }
  framedLines.push(createFramedLine(''));
  framedLines.push(createFramedLine(counts.plain, counts.rendered));

  printFramedBox(framedLines);
};

const resolveDiffMode = async (
  diffInfo: DiffInfo | null,
  effectiveDiff: boolean | string | undefined,
  shouldSkipPrompts: boolean,
  isScoreOnly: boolean,
): Promise<boolean> => {
  if (effectiveDiff !== undefined && effectiveDiff !== false) {
    if (diffInfo) return true;
    if (!isScoreOnly) {
      logger.warn('No feature branch or uncommitted changes detected. Running full scan.');
      logger.break();
    }
    return false;
  }

  if (effectiveDiff === false || !diffInfo) return false;

  const changedSourceFiles = filterSourceFiles(diffInfo.changedFiles);
  if (changedSourceFiles.length === 0) return false;
  if (shouldSkipPrompts) return true;
  if (isScoreOnly) return false;

  const promptMessage = diffInfo.isCurrentChanges
    ? `Found ${changedSourceFiles.length} uncommitted changed files. Only scan current changes?`
    : `On branch ${diffInfo.currentBranch} (${changedSourceFiles.length} changed files vs ${diffInfo.baseBranch}). Only scan this branch?`;

  const { shouldScanChangedOnly } = await prompts(
    {
      type: 'confirm',
      name: 'shouldScanChangedOnly',
      message: promptMessage,
      initial: true,
    },
    {
      onCancel: () => {
        logger.break();
        logger.log('Cancelled.');
        logger.break();
        process.exit(0);
      },
    },
  );
  return Boolean(shouldScanChangedOnly);
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
    audit: fromCli('audit') ? flags.audit : (config?.audit ?? flags.audit),
    verbose: fromCli('verbose') ? flags.verbose : (config?.verbose ?? flags.verbose),
    fix: flags.fix,
  };
};

const exitWithCancelHint = () => {
  logger.break();
  logger.log('Cancelled.');
  logger.break();
  process.exit(0);
};

process.on('SIGINT', exitWithCancelHint);
process.on('SIGTERM', exitWithCancelHint);

const main = new Command()
  .name('svelte-doctor')
  .description('Diagnose Svelte codebase health')
  .version(VERSION, '-v, --version', 'display the version number')
  .argument('[directory]', 'project directory to scan', '.')
  .option('--no-lint', 'skip lint diagnostics')
  .option('--no-js-ts-lint', 'skip JavaScript/TypeScript lint diagnostics')
  .option('--no-dead-code', 'skip dead code detection')
  .option('--no-audit', 'skip dependency vulnerability audit')
  .option('--fix', 'auto-fix lint issues where possible')
  .option('--verbose', 'show file details per rule')
  .option('--score', 'output only the score')
  .option('-y, --yes', 'skip prompts, scan all workspace projects');

addAnalyticsOption(main);

main
  .option('--format <format>', 'output format: text or json', 'text')
  .option('--project <name>', 'select workspace project (comma-separated)')
  .option('--diff [base]', 'scan only files changed vs base branch')
  .option('--offline', 'skip remote scoring (local score only)')
  .action(async (directory: string, flags: CliFlags) => {
    const isScoreOnly = flags.score;

    try {
      const resolvedDirectory = path.resolve(directory);
      const config = loadConfig(resolvedDirectory);
      const scanOptions = resolveScanOptions(flags, config, main);

      const isAutomated = isAutomatedEnvironment();
      const shouldSkipPrompts = flags.yes || isAutomated || !process.stdin.isTTY;

      if (!isScoreOnly && flags.format !== 'json') {
        logger.log(`svelte-doctor v${VERSION}`);
        logger.break();
      }

      const projectDirectories = await selectProjects(
        resolvedDirectory,
        flags.project,
        shouldSkipPrompts,
      );

      const isDiffCliOverride = main.getOptionValueSource('diff') === 'cli';
      const effectiveDiff = isDiffCliOverride ? flags.diff : config?.diff;
      const explicitBaseBranch = typeof effectiveDiff === 'string' ? effectiveDiff : undefined;
      const diffInfo = getDiffInfo(resolvedDirectory, explicitBaseBranch);
      const isDiffMode = await resolveDiffMode(
        diffInfo,
        effectiveDiff,
        shouldSkipPrompts,
        isScoreOnly,
      );

      if (isDiffMode && diffInfo && !isScoreOnly && flags.format !== 'json') {
        if (diffInfo.isCurrentChanges) {
          logger.log('Scanning uncommitted changes');
        } else {
          logger.log(
            `Scanning changes: ${highlighter.info(diffInfo.currentBranch)} → ${highlighter.info(diffInfo.baseBranch)}`,
          );
        }
        logger.break();
      }

      const isJsonFormat = flags.format === 'json';

      if (!isScoreOnly && !isAutomated && !flags.yes && !isJsonFormat) {
        await maybePromptAnalyticsConsent(shouldSkipPrompts);
      }

      const allDiagnostics: Diagnostic[] = [];
      let totalElapsedMs = 0;
      let totalFilesScanned = 0;
      const allSkippedChecks = new Set<string>();
      const telemetryUrl = process.env.FRAMEWORK_DOCTOR_TELEMETRY_URL ?? '';

      for (const projectDirectory of projectDirectories) {
        let includePaths: string[] | undefined;
        if (isDiffMode) {
          const projectDiffInfo = getDiffInfo(projectDirectory, explicitBaseBranch);
          if (projectDiffInfo) {
            const changedSourceFiles = filterSourceFiles(projectDiffInfo.changedFiles);
            if (changedSourceFiles.length === 0) {
              if (!isScoreOnly && !isJsonFormat) {
                logger.dim(`No changed source files in ${projectDirectory}, skipping.`);
                logger.break();
              }
              continue;
            }
            includePaths = changedSourceFiles;
          }
        }

        if (!isScoreOnly && !isJsonFormat) {
          logger.dim(`Scanning ${projectDirectory}...`);
          logger.break();
        }

        const startTime = performance.now();
        const result = await scan(projectDirectory, {
          ...scanOptions,
          includePaths: includePaths ?? [],
        });
        const elapsedMs = performance.now() - startTime;

        allDiagnostics.push(...result.diagnostics);
        totalElapsedMs += elapsedMs;
        totalFilesScanned +=
          (includePaths?.length ?? 0) > 0
            ? (includePaths?.length ?? 0)
            : result.projectInfo.sourceFileCount;
        for (const skipped of result.skippedChecks) {
          allSkippedChecks.add(skipped);
        }

        if (
          telemetryUrl &&
          result.scoreResult &&
          shouldSendAnalytics(
            { analytics: flags.analytics, yes: flags.yes },
            config?.analytics,
            isAutomated,
          )
        ) {
          sendScanEvent(
            telemetryUrl,
            result.projectInfo,
            result.scoreResult,
            result.diagnostics.length,
            {
              isDiffMode: Boolean(includePaths?.length),
              cliVersion: VERSION,
            },
          );
        }

        if (flags.score && !isJsonFormat) {
          if (result.scoreResult) {
            logger.log(`${result.scoreResult.score}`);
          }
          continue;
        }

        if (isJsonFormat) {
          continue;
        }

        if (result.diagnostics.length === 0) {
          logger.success('No issues found!');
        } else {
          printDiagnostics(result.diagnostics, Boolean(scanOptions.verbose));
        }

        logger.break();
        const totalSourceFileCount =
          (includePaths?.length ?? 0) > 0
            ? (includePaths?.length ?? 0)
            : result.projectInfo.sourceFileCount;
        printSummary(
          result.scoreResult,
          result.diagnostics,
          totalSourceFileCount,
          elapsedMs,
          Boolean(scanOptions.verbose),
        );

        try {
          const diagnosticsDirectory = writeDiagnosticsDirectory(result.diagnostics);
          logger.break();
          logger.dim(`  Full diagnostics written to ${diagnosticsDirectory}`);
        } catch {
          logger.break();
        }

        if (!isScoreOnly) {
          logger.break();
        }
      }

      if (isJsonFormat) {
        const hasHighOrCriticalSecurityFindings = allDiagnostics.some(
          (d) => d.category === 'security' && d.severity === 'error',
        );
        const scoreResult =
          totalFilesScanned > 0
            ? calculateScore(allDiagnostics, totalFilesScanned, {
                hasHighOrCriticalSecurityFindings,
              })
            : { score: 100, label: 'Great', breakdown: undefined };
        const output = {
          doctor: 'svelte-doctor',
          version: VERSION,
          diagnostics: allDiagnostics,
          scoreResult,
          totalFilesScanned,
          elapsedMilliseconds: totalElapsedMs,
          skippedChecks: [...allSkippedChecks],
        };
        logger.log(JSON.stringify(output, null, 2));
        return;
      }

      if (!isScoreOnly && !shouldSkipPrompts) {
        await maybePromptSkillInstall(shouldSkipPrompts);
      }
    } catch (error) {
      handleError(error);
    }
  })
  .addHelpText(
    'after',
    `
${highlighter.dim('Learn more:')}
  ${highlighter.info('https://github.com/pitis/framework-doctor')}
`,
  );

main.parseAsync();
