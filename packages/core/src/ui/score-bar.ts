import { PERFECT_SCORE, SCORE_BAR_WIDTH_CHARS } from '../constants.js';
import { colorizeByScore } from './colorize-by-score.js';
import { highlighter } from './highlighter.js';

export const buildScoreBar = (score: number): { plain: string; rendered: string } => {
  const filledCount = Math.round((score / PERFECT_SCORE) * SCORE_BAR_WIDTH_CHARS);
  const emptyCount = SCORE_BAR_WIDTH_CHARS - filledCount;
  const filled = '█'.repeat(filledCount);
  const empty = '░'.repeat(emptyCount);
  return {
    plain: filled + empty,
    rendered: colorizeByScore(filled, score) + highlighter.dim(empty),
  };
};
