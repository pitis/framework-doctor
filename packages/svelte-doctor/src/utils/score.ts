import { PERFECT_SCORE, SCORE_GOOD_THRESHOLD, SCORE_OK_THRESHOLD } from '../constants.js';
import type { Diagnostic, ScoreResult } from '../types.js';

const scorePenalty = (diagnostic: Diagnostic): number => {
  const severityPenalty = diagnostic.severity === 'error' ? 6 : 2;
  return diagnostic.weight ?? severityPenalty;
};

export const calculateScore = (diagnostics: Diagnostic[]): ScoreResult => {
  const penalty = diagnostics.reduce((total, diagnostic) => total + scorePenalty(diagnostic), 0);
  const score = Math.max(0, PERFECT_SCORE - penalty);
  let label: ScoreResult['label'];
  if (score >= SCORE_GOOD_THRESHOLD) {
    label = 'Great';
  } else if (score >= SCORE_OK_THRESHOLD) {
    label = 'Needs work';
  } else {
    label = 'Critical';
  }
  return { score, label };
};
