import { describe, expect, it } from 'vitest';
import type { Diagnostic, VueDoctorConfig } from '../src/types.js';
import { combineDiagnostics, computeVueIncludePaths } from '../src/utils/combine-diagnostics.js';

const createDiagnostic = (overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  filePath: 'src/App.vue',
  plugin: 'vue-doctor',
  rule: 'test-rule',
  severity: 'warning',
  message: 'test message',
  help: 'test help',
  line: 1,
  column: 1,
  category: 'Test',
  ...overrides,
});

describe('computeVueIncludePaths', () => {
  it('returns undefined for empty include paths', () => {
    expect(computeVueIncludePaths([])).toBeUndefined();
  });

  it('filters to only Vue/TS/JS source files', () => {
    const paths = ['src/App.vue', 'src/utils.ts', 'src/Button.jsx', 'src/config.js'];
    const result = computeVueIncludePaths(paths);
    expect(result).toEqual(['src/App.vue', 'src/utils.ts', 'src/Button.jsx', 'src/config.js']);
  });

  it('returns empty array when no source files exist', () => {
    const paths = ['readme.md', 'package.json'];
    const result = computeVueIncludePaths(paths);
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
      createDiagnostic({ plugin: 'vue', rule: 'no-unused-vars' }),
      createDiagnostic({ plugin: 'vue-doctor', rule: 'no-giant-component' }),
    ];
    const config: VueDoctorConfig = {
      ignore: { rules: ['vue/no-unused-vars'] },
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
