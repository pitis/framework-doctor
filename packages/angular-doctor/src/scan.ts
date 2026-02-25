import type { FramedLine } from '@framework-doctor/core';
import {
  buildCountsSummaryLine,
  buildScoreBar,
  buildScoreBreakdownLines,
  colorizeByScore,
  createFramedLine,
  getDoctorFace,
  groupBy,
  highlighter,
  indentMultilineText,
  logger,
  PERFECT_SCORE,
  printFramedBox,
  spinner,
} from '@framework-doctor/core';
import { performance } from 'node:perf_hooks';
import { OFFLINE_FLAG_MESSAGE } from './constants.js';
import type {
  AngularDoctorConfig,
  Diagnostic,
  ProjectInfo,
  ScanOptions,
  ScanResult,
  ScoreResult,
} from './types.js';
import { calculateScore } from './utils/calculate-score.js';
import { combineDiagnostics, computeAngularIncludePaths } from './utils/combine-diagnostics.js';
import { discoverProject } from './utils/discover-project.js';
import { loadConfig } from './utils/load-config.js';
import { runEslint } from './utils/run-eslint.js';
import { runKnip } from './utils/run-knip.js';
import { runSecurityScan } from './utils/run-security-scan.js';
import { writeDiagnosticsDirectory } from './utils/write-diagnostics-dir.js';

const SEVERITY_ORDER: Record<Diagnostic['severity'], number> = {
  error: 0,
  warning: 1,
};

const colorizeBySeverity = (text: string, severity: Diagnostic['severity']): string =>
  severity === 'error' ? highlighter.error(text) : highlighter.warn(text);

const sortBySeverity = (diagnosticGroups: [string, Diagnostic[]][]): [string, Diagnostic[]][] =>
  diagnosticGroups.toSorted(([, diagnosticsA], [, diagnosticsB]) => {
    const severityA = SEVERITY_ORDER[diagnosticsA[0].severity];
    const severityB = SEVERITY_ORDER[diagnosticsB[0].severity];
    return severityA - severityB;
  });

const buildFileLineMap = (diagnostics: Diagnostic[]): Map<string, number[]> => {
  const fileLines = new Map<string, number[]>();
  for (const diagnostic of diagnostics) {
    const lines = fileLines.get(diagnostic.filePath) ?? [];
    if (diagnostic.line > 0) {
      lines.push(diagnostic.line);
    }
    fileLines.set(diagnostic.filePath, lines);
  }
  return fileLines;
};

const hasHighOrCriticalSecurityFindings = (diagnostics: Diagnostic[]): boolean =>
  diagnostics.some(
    (diagnostic) => diagnostic.category === 'security' && diagnostic.severity === 'error',
  );

const printProjectDetection = (
  projectInfo: ProjectInfo,
  userConfig: AngularDoctorConfig | null,
  isDiffMode: boolean,
  includePaths: string[],
): void => {
  const languageLabel = projectInfo.hasTypeScript ? 'TypeScript' : 'JavaScript';

  const completeStep = (message: string) => {
    spinner(message).start().succeed(message);
  };

  completeStep(`Detecting framework. Found ${highlighter.info('Angular')}.`);
  completeStep(
    `Detecting Angular version. Found ${highlighter.info(`Angular ${projectInfo.angularVersion ?? 'unknown'}`)}.`,
  );
  completeStep(`Detecting language. Found ${highlighter.info(languageLabel)}.`);

  if (isDiffMode) {
    completeStep(`Scanning ${highlighter.info(`${includePaths.length}`)} changed source files.`);
  } else {
    completeStep(`Found ${highlighter.info(`${projectInfo.sourceFileCount}`)} source files.`);
  }

  if (userConfig) {
    completeStep(`Loaded ${highlighter.info('angular-doctor config')}.`);
  }

  logger.break();
};

const printDiagnostics = (diagnostics: Diagnostic[], isVerbose: boolean): void => {
  const ruleGroups = groupBy(
    diagnostics,
    (diagnostic) => `${diagnostic.plugin}/${diagnostic.rule}`,
  );

  const sortedRuleGroups = sortBySeverity([...ruleGroups.entries()]);

  for (const [, ruleDiagnostics] of sortedRuleGroups) {
    const firstDiagnostic = ruleDiagnostics[0];
    const severitySymbol = firstDiagnostic.severity === 'error' ? '✗' : '⚠';
    const icon = colorizeBySeverity(severitySymbol, firstDiagnostic.severity);
    const count = ruleDiagnostics.length;
    const countLabel = count > 1 ? colorizeBySeverity(` (${count})`, firstDiagnostic.severity) : '';

    logger.log(`  ${icon} ${firstDiagnostic.message}${countLabel}`);
    if (firstDiagnostic.help) {
      logger.dim(indentMultilineText(firstDiagnostic.help, '    '));
    }

    if (isVerbose) {
      const fileLines = buildFileLineMap(ruleDiagnostics);

      for (const [filePath, lines] of fileLines) {
        const lineLabel = lines.length > 0 ? `: ${lines.join(', ')}` : '';
        logger.dim(`    ${filePath}${lineLabel}`);
      }
    }

    logger.break();
  }
};

const printBranding = (score?: number): void => {
  if (score !== undefined) {
    const [eyes, mouth] = getDoctorFace(score);
    const colorize = (text: string) => colorizeByScore(text, score);
    logger.log(colorize('  ┌─────┐'));
    logger.log(colorize(`  │ ${eyes} │`));
    logger.log(colorize(`  │ ${mouth} │`));
    logger.log(colorize('  └─────┘'));
  }
  logger.log('  Angular Doctor');
  logger.break();
};

const printScoreGauge = (score: number, label: string): void => {
  const scoreDisplay = colorizeByScore(`${score}`, score);
  const labelDisplay = colorizeByScore(label, score);
  const bar = buildScoreBar(score);
  logger.log(`  ${scoreDisplay} / ${PERFECT_SCORE}  ${labelDisplay}`);
  logger.break();
  logger.log(`  ${bar.rendered}`);
  logger.break();
};

const buildBrandingLines = (
  scoreResult: ScoreResult | null,
  noScoreMessage: string,
  verbose: boolean,
): FramedLine[] => {
  const lines: FramedLine[] = [];

  if (scoreResult) {
    const [eyes, mouth] = getDoctorFace(scoreResult.score);
    const scoreColorizer = (text: string): string => colorizeByScore(text, scoreResult.score);

    lines.push(createFramedLine('┌─────┐', scoreColorizer('┌─────┐')));
    lines.push(createFramedLine(`│ ${eyes} │`, scoreColorizer(`│ ${eyes} │`)));
    lines.push(createFramedLine(`│ ${mouth} │`, scoreColorizer(`│ ${mouth} │`)));
    lines.push(createFramedLine('└─────┘', scoreColorizer('└─────┘')));
    lines.push(createFramedLine('Angular Doctor', 'Angular Doctor'));
    lines.push(createFramedLine(''));

    const scoreLinePlainText = `${scoreResult.score} / ${PERFECT_SCORE}  ${scoreResult.label}`;
    const scoreLineRenderedText = `${colorizeByScore(String(scoreResult.score), scoreResult.score)} / ${PERFECT_SCORE}  ${colorizeByScore(scoreResult.label, scoreResult.score)}`;
    lines.push(createFramedLine(scoreLinePlainText, scoreLineRenderedText));
    lines.push(createFramedLine(''));
    const bar = buildScoreBar(scoreResult.score);
    lines.push(createFramedLine(bar.plain, bar.rendered));
    if (verbose && scoreResult.breakdown) {
      lines.push(createFramedLine(''));
      lines.push(...buildScoreBreakdownLines(scoreResult.breakdown));
    }
    lines.push(createFramedLine(''));
  } else {
    lines.push(createFramedLine('Angular Doctor', 'Angular Doctor'));
    lines.push(createFramedLine(''));
    lines.push(createFramedLine(noScoreMessage, highlighter.dim(noScoreMessage)));
    lines.push(createFramedLine(''));
  }

  return lines;
};

const toCountsFramedLine = (
  diagnostics: Diagnostic[],
  totalSourceFileCount: number,
  elapsedMilliseconds: number,
): FramedLine => {
  const { plain, rendered } = buildCountsSummaryLine(
    diagnostics,
    totalSourceFileCount,
    elapsedMilliseconds,
  );
  return createFramedLine(plain, rendered);
};

const printSummary = (
  diagnostics: Diagnostic[],
  elapsedMilliseconds: number,
  scoreResult: ScoreResult | null,
  projectName: string,
  totalSourceFileCount: number,
  noScoreMessage: string,
  verbose: boolean,
): void => {
  const summaryFramedLines = [
    ...buildBrandingLines(scoreResult, noScoreMessage, verbose),
    toCountsFramedLine(diagnostics, totalSourceFileCount, elapsedMilliseconds),
  ];
  printFramedBox(summaryFramedLines);

  try {
    const diagnosticsDirectory = writeDiagnosticsDirectory(diagnostics);
    logger.break();
    logger.dim(`  Full diagnostics written to ${diagnosticsDirectory}`);
  } catch {
    logger.break();
  }
};

interface ResolvedScanOptions {
  lint: boolean;
  deadCode: boolean;
  verbose: boolean;
  scoreOnly: boolean;
  includePaths: string[];
}

const mergeScanOptions = (
  inputOptions: ScanOptions,
  userConfig: AngularDoctorConfig | null,
): ResolvedScanOptions => ({
  lint: inputOptions.lint ?? userConfig?.lint ?? true,
  deadCode: inputOptions.deadCode ?? userConfig?.deadCode ?? true,
  verbose: inputOptions.verbose ?? userConfig?.verbose ?? false,
  scoreOnly: inputOptions.scoreOnly ?? false,
  includePaths: inputOptions.includePaths ?? [],
});

export const scan = async (
  directory: string,
  inputOptions: ScanOptions = {},
): Promise<ScanResult> => {
  const startTime = performance.now();
  const projectInfo = discoverProject(directory);
  const userConfig = loadConfig(directory);
  const options = mergeScanOptions(inputOptions, userConfig);
  const { includePaths } = options;
  const isDiffMode = includePaths.length > 0;

  if (!projectInfo.angularVersion) {
    throw new Error('No Angular dependency found in package.json');
  }

  if (!options.scoreOnly) {
    printProjectDetection(projectInfo, userConfig, isDiffMode, includePaths);
  }

  const angularIncludePaths = computeAngularIncludePaths(includePaths) ?? includePaths;

  let didLintFail = false;
  let didDeadCodeFail = false;

  const lintPromise = options.lint
    ? (async () => {
        const lintSpinner = options.scoreOnly ? null : spinner('Running lint checks...').start();
        try {
          const lintDiagnostics = await runEslint(directory, angularIncludePaths);
          lintSpinner?.succeed('Running lint checks.');
          return lintDiagnostics;
        } catch (error) {
          didLintFail = true;
          lintSpinner?.fail('Lint checks failed (non-fatal, skipping).');
          logger.error(String(error));
          return [];
        }
      })()
    : Promise.resolve<Diagnostic[]>([]);

  const deadCodePromise =
    options.deadCode && !isDiffMode
      ? (async () => {
          const deadCodeSpinner = options.scoreOnly
            ? null
            : spinner('Detecting dead code...').start();
          try {
            const knipDiagnostics = await runKnip(directory);
            deadCodeSpinner?.succeed('Detecting dead code.');
            return knipDiagnostics;
          } catch (error) {
            didDeadCodeFail = true;
            deadCodeSpinner?.fail('Dead code detection failed (non-fatal, skipping).');
            logger.error(String(error));
            return [];
          }
        })()
      : Promise.resolve<Diagnostic[]>([]);

  const securityPromise = options.lint
    ? runSecurityScan(directory, includePaths)
    : Promise.resolve<Diagnostic[]>([]);

  const [lintDiagnostics, deadCodeDiagnostics, securityDiagnostics] = await Promise.all([
    lintPromise,
    deadCodePromise,
    securityPromise,
  ]);

  const diagnostics = combineDiagnostics(
    lintDiagnostics,
    deadCodeDiagnostics,
    securityDiagnostics,
    directory,
    isDiffMode,
    userConfig,
  );

  const elapsedMilliseconds = performance.now() - startTime;

  const skippedChecks: string[] = [];
  if (didLintFail) skippedChecks.push('lint');
  if (didDeadCodeFail) skippedChecks.push('dead code');
  const hasSkippedChecks = skippedChecks.length > 0;

  const totalFilesScanned = isDiffMode ? includePaths.length : projectInfo.sourceFileCount;
  const scoreResult = await calculateScore(diagnostics, totalFilesScanned, {
    hasHighOrCriticalSecurityFindings: hasHighOrCriticalSecurityFindings(diagnostics),
  });
  const noScoreMessage = OFFLINE_FLAG_MESSAGE;

  if (options.scoreOnly) {
    if (scoreResult) {
      logger.log(`${scoreResult.score}`);
    } else {
      logger.dim(noScoreMessage);
    }
    return { diagnostics, scoreResult, skippedChecks, projectInfo };
  }

  if (diagnostics.length === 0) {
    if (hasSkippedChecks) {
      const skippedLabel = skippedChecks.join(' and ');
      logger.warn(
        `No issues detected, but ${skippedLabel} checks failed — results are incomplete.`,
      );
    } else {
      logger.success('No issues found!');
    }
    logger.break();
    if (hasSkippedChecks) {
      printBranding();
      logger.dim('  Score not shown — some checks could not complete.');
    } else if (scoreResult) {
      printBranding(scoreResult.score);
      printScoreGauge(scoreResult.score, scoreResult.label);
    } else {
      logger.dim(`  ${noScoreMessage}`);
    }
    return { diagnostics, scoreResult, skippedChecks, projectInfo };
  }

  printDiagnostics(diagnostics, options.verbose);

  const displayedSourceFileCount = isDiffMode ? includePaths.length : projectInfo.sourceFileCount;

  printSummary(
    diagnostics,
    elapsedMilliseconds,
    scoreResult,
    projectInfo.projectName,
    displayedSourceFileCount,
    noScoreMessage,
    options.verbose,
  );

  if (hasSkippedChecks) {
    const skippedLabel = skippedChecks.join(' and ');
    logger.break();
    logger.warn(`  Note: ${skippedLabel} checks failed — score may be incomplete.`);
  }

  return { diagnostics, scoreResult, skippedChecks, projectInfo };
};
