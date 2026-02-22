import type { ScoreBreakdown } from '../types.js';
import type { FramedLine } from './framed-box.js';
import { createFramedLine } from './framed-box.js';

export const buildScoreBreakdownLines = (breakdown: ScoreBreakdown): FramedLine[] => {
  const typesPenaltyRounded = Math.round(breakdown.typesPenalty * 10) / 10;
  const volumePenaltyRounded = Math.round(breakdown.volumePenalty * 10) / 10;
  const spreadPenaltyRounded = Math.round(breakdown.spreadPenalty * 10) / 10;

  return [
    createFramedLine(
      `Types penalty: ${typesPenaltyRounded} (${breakdown.uniqueErrorRules} error rules, ${breakdown.uniqueWarningRules} warning rules)`,
    ),
    createFramedLine(
      `Volume penalty: ${volumePenaltyRounded} (${breakdown.errorCount} errors, ${breakdown.warningCount} warnings)`,
    ),
    createFramedLine(
      `Spread penalty: ${spreadPenaltyRounded} (${breakdown.filesWithDiagnostics}/${breakdown.totalFilesScanned} files)`,
    ),
    ...(breakdown.didApplyGuardrail
      ? [createFramedLine(`Guardrail applied: yes (${breakdown.guardrailReasons.join(', ')})`)]
      : [createFramedLine('Guardrail applied: no')]),
  ];
};
