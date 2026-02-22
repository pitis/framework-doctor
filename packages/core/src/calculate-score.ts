import {
  ERROR_RULE_PENALTY,
  ERROR_VOLUME_COEFFICIENT,
  PERFECT_SCORE,
  SCORE_BLOCKING_CHECK_CAP,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  SPREAD_PENALTY_MAX,
  WARNING_RULE_PENALTY,
  WARNING_VOLUME_COEFFICIENT,
} from './constants.js';
import type { Diagnostic, ScoreBreakdown, ScoreGuardrailInput, ScoreResult } from './types.js';

const getScoreLabel = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return 'Great';
  if (score >= SCORE_OK_THRESHOLD) return 'Needs work';
  return 'Critical';
};

const countMetrics = (
  diagnostics: Diagnostic[],
): {
  errorCount: number;
  warningCount: number;
  uniqueErrorRules: number;
  uniqueWarningRules: number;
  filesWithDiagnostics: number;
} => {
  const errorRules = new Set<string>();
  const warningRules = new Set<string>();
  const filesWithDiagnostics = new Set<string>();

  for (const diagnostic of diagnostics) {
    filesWithDiagnostics.add(diagnostic.filePath);
    const ruleKey = `${diagnostic.plugin}/${diagnostic.rule}`;
    if (diagnostic.severity === 'error') {
      errorRules.add(ruleKey);
    } else {
      warningRules.add(ruleKey);
    }
  }

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  return {
    errorCount,
    warningCount,
    uniqueErrorRules: errorRules.size,
    uniqueWarningRules: warningRules.size,
    filesWithDiagnostics: filesWithDiagnostics.size,
  };
};

export const calculateScore = (
  diagnostics: Diagnostic[],
  totalFilesScanned: number,
  guardrailInput: ScoreGuardrailInput = {},
): ScoreResult => {
  if (diagnostics.length === 0) {
    return {
      score: PERFECT_SCORE,
      label: getScoreLabel(PERFECT_SCORE),
    };
  }

  const { errorCount, warningCount, uniqueErrorRules, uniqueWarningRules, filesWithDiagnostics } =
    countMetrics(diagnostics);

  const typesPenalty =
    uniqueErrorRules * ERROR_RULE_PENALTY + uniqueWarningRules * WARNING_RULE_PENALTY;
  const volumePenalty =
    ERROR_VOLUME_COEFFICIENT * Math.sqrt(errorCount) +
    WARNING_VOLUME_COEFFICIENT * Math.sqrt(warningCount);
  const spreadPenalty =
    totalFilesScanned > 0 ? SPREAD_PENALTY_MAX * (filesWithDiagnostics / totalFilesScanned) : 0;

  const totalPenalty = typesPenalty + volumePenalty + spreadPenalty;
  const uncappedScore = Math.max(
    0,
    Math.min(PERFECT_SCORE, Math.round(PERFECT_SCORE - totalPenalty)),
  );
  const guardrailReasons: string[] = [];
  if (guardrailInput.didBuildFail) {
    guardrailReasons.push('build failed');
  }
  if (guardrailInput.didTestsFail) {
    guardrailReasons.push('tests failed');
  }
  if (guardrailInput.didTypecheckFail) {
    guardrailReasons.push('typecheck failed');
  }
  if (guardrailInput.hasHighOrCriticalSecurityFindings) {
    guardrailReasons.push('high/critical security findings');
  }

  const didApplyGuardrail = guardrailReasons.length > 0;
  const score = didApplyGuardrail
    ? Math.min(uncappedScore, SCORE_BLOCKING_CHECK_CAP)
    : uncappedScore;

  const breakdown: ScoreBreakdown = {
    typesPenalty,
    volumePenalty,
    spreadPenalty,
    didApplyGuardrail,
    guardrailReasons,
    uniqueErrorRules,
    uniqueWarningRules,
    errorCount,
    warningCount,
    filesWithDiagnostics,
    totalFilesScanned,
  };

  return { score, label: getScoreLabel(score), breakdown };
};
