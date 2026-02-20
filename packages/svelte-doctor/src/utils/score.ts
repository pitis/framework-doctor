import type { Diagnostic, ScoreResult } from "../types.js";

const scorePenalty = (diagnostic: Diagnostic): number => {
  const severityPenalty = diagnostic.severity === "error" ? 6 : 2;
  return diagnostic.weight ?? severityPenalty;
};

export const calculateScore = (diagnostics: Diagnostic[]): ScoreResult => {
  const penalty = diagnostics.reduce((total, diagnostic) => total + scorePenalty(diagnostic), 0);
  const score = Math.max(0, 100 - penalty);
  const label = score >= 75 ? "Great" : score >= 50 ? "Needs work" : "Critical";
  return { score, label };
};
