import { calculateScore as calculateScoreFromCore } from '@framework-doctor/core';
import type { Diagnostic, ScoreGuardrailInput, ScoreResult } from '../types.js';

export const calculateScore = async (
  diagnostics: Diagnostic[],
  totalFilesScanned: number,
  guardrailInput: ScoreGuardrailInput = {},
): Promise<ScoreResult> =>
  Promise.resolve(calculateScoreFromCore(diagnostics, totalFilesScanned, guardrailInput));
