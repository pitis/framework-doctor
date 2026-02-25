import { describe, expect, it } from 'vitest';
import { calculateScore } from '../src/utils/calculate-score.js';

const baseDiagnostic = {
  message: '',
  help: '',
  line: 1,
  column: 1,
  category: 'correctness',
};

describe('calculateScore', () => {
  it('returns perfect score when there are no diagnostics', () => {
    expect(calculateScore([], 8)).toEqual({ score: 100, label: 'Great' });
  });

  it('penalizes errors more than warnings', () => {
    const result = calculateScore(
      [
        {
          ...baseDiagnostic,
          filePath: 'src/a.component.ts',
          plugin: '@angular-eslint',
          rule: 'x',
          severity: 'error',
        },
        {
          ...baseDiagnostic,
          filePath: 'src/b.component.ts',
          plugin: '@angular-eslint',
          rule: 'y',
          severity: 'warning',
        },
      ],
      8,
    );

    expect(result.score).toBe(91);
    expect(result.label).toBe('Great');
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown?.typesPenalty).toBe(3.5);
    expect(result.breakdown?.volumePenalty).toBeCloseTo(2.6);
    expect(result.breakdown?.spreadPenalty).toBe(3);
  });

  it('uses zero spread penalty when totalFilesScanned is zero', () => {
    const result = calculateScore(
      [
        {
          ...baseDiagnostic,
          filePath: 'src/a.component.ts',
          plugin: '@angular-eslint',
          rule: 'x',
          severity: 'error',
        },
      ],
      0,
    );

    expect(result.breakdown?.spreadPenalty).toBe(0);
  });

  it('produces ~81 for 6 errors, 7 warnings, 2/8 files with UE=2, UW=4', () => {
    const diagnostics: Parameters<typeof calculateScore>[0] = [];
    for (let i = 0; i < 6; i++) {
      diagnostics.push({
        ...baseDiagnostic,
        filePath: i < 3 ? 'src/a.component.ts' : 'src/b.component.ts',
        plugin: '@angular-eslint',
        rule: i < 4 ? 'rule-a' : 'rule-b',
        severity: 'error',
      });
    }
    for (let i = 0; i < 7; i++) {
      diagnostics.push({
        ...baseDiagnostic,
        filePath: i < 4 ? 'src/a.component.ts' : 'src/b.component.ts',
        plugin: 'eslint',
        rule: `rule-${i % 4}`,
        severity: 'warning',
      });
    }

    const result = calculateScore(diagnostics, 8);

    expect(result.score).toBe(81);
    expect(result.label).toBe('Great');
    expect(result.breakdown?.uniqueErrorRules).toBe(2);
    expect(result.breakdown?.uniqueWarningRules).toBe(4);
    expect(result.breakdown?.errorCount).toBe(6);
    expect(result.breakdown?.warningCount).toBe(7);
    expect(result.breakdown?.filesWithDiagnostics).toBe(2);
    expect(result.breakdown?.totalFilesScanned).toBe(8);
  });

  it('caps score at 59 when guardrail input is triggered', () => {
    const result = calculateScore(
      [
        {
          ...baseDiagnostic,
          filePath: 'src/a.component.ts',
          plugin: 'eslint',
          rule: 'no-console',
          severity: 'warning',
        },
      ],
      8,
      {
        hasHighOrCriticalSecurityFindings: true,
      },
    );

    expect(result.score).toBe(59);
    expect(result.breakdown?.didApplyGuardrail).toBe(true);
    expect(result.breakdown?.guardrailReasons).toEqual(['high/critical security findings']);
  });
});
