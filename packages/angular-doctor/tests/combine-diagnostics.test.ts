import { describe, expect, it } from 'vitest';
import type { AngularDoctorConfig, Diagnostic } from '../src/types.js';
import {
  combineDiagnostics,
  computeAngularIncludePaths,
} from '../src/utils/combine-diagnostics.js';

const createDiagnostic = (overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  filePath: 'src/app.component.ts',
  plugin: 'angular-doctor',
  rule: 'test-rule',
  severity: 'warning',
  message: 'test message',
  help: 'test help',
  line: 1,
  column: 1,
  category: 'Test',
  ...overrides,
});

describe('computeAngularIncludePaths', () => {
  it('returns undefined for empty include paths', () => {
    expect(computeAngularIncludePaths([])).toBeUndefined();
  });

  it('filters to only Angular source files (html, ts, mts, cts, mjs, cjs)', () => {
    const paths = [
      'src/app.component.html',
      'src/utils.ts',
      'src/button.component.ts',
      'config.js',
    ];
    const result = computeAngularIncludePaths(paths);
    expect(result).toEqual(['src/app.component.html', 'src/utils.ts', 'src/button.component.ts']);
  });

  it('returns empty array when no source files exist', () => {
    const paths = ['readme.md', 'package.json'];
    const result = computeAngularIncludePaths(paths);
    expect(result).toEqual([]);
  });
});

describe('combineDiagnostics', () => {
  it('merges lint and dead code diagnostics', () => {
    const lintDiagnostics = [createDiagnostic({ rule: 'lint-rule' })];
    const deadCodeDiagnostics = [createDiagnostic({ rule: 'dead-code-rule' })];

    const result = combineDiagnostics(lintDiagnostics, deadCodeDiagnostics, [], '/tmp', true, null);
    expect(result).toHaveLength(2);
    expect(result[0].rule).toBe('lint-rule');
    expect(result[1].rule).toBe('dead-code-rule');
  });

  it('returns empty array when both inputs are empty in diff mode', () => {
    const result = combineDiagnostics([], [], [], '/tmp', true, null);
    expect(result).toEqual([]);
  });

  it('applies config filtering when userConfig is provided', () => {
    const diagnostics = [
      createDiagnostic({ plugin: '@angular-eslint', rule: 'component-selector' }),
      createDiagnostic({ plugin: 'angular-doctor', rule: 'no-giant-component' }),
    ];
    const config: AngularDoctorConfig = {
      ignore: { rules: ['@angular-eslint/component-selector'] },
    };

    const result = combineDiagnostics(diagnostics, [], [], '/tmp', true, config);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('no-giant-component');
  });

  it('skips config filtering when userConfig is null', () => {
    const diagnostics = [createDiagnostic(), createDiagnostic()];
    const result = combineDiagnostics(diagnostics, [], [], '/tmp', true, null);
    expect(result).toHaveLength(2);
  });
});
