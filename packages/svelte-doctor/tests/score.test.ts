import { describe, expect, it } from 'vitest';
import { calculateScore } from '../src/utils/score.js';

describe('calculateScore', () => {
  it('returns perfect score when there are no diagnostics', () => {
    expect(calculateScore([])).toEqual({ score: 100, label: 'Great' });
  });

  it('penalizes errors more than warnings', () => {
    const result = calculateScore([
      {
        filePath: 'src/a.svelte',
        plugin: 'svelte-check',
        rule: 'x',
        severity: 'error',
        message: 'e',
        help: '',
        line: 1,
        column: 1,
        category: 'correctness',
      },
      {
        filePath: 'src/b.svelte',
        plugin: 'svelte-check',
        rule: 'y',
        severity: 'warning',
        message: 'w',
        help: '',
        line: 1,
        column: 1,
        category: 'correctness',
      },
    ]);

    expect(result.score).toBe(92);
    expect(result.label).toBe('Great');
  });
});
