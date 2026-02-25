import { describe, expect, it } from 'vitest';
import type { Diagnostic, VueDoctorConfig } from '../src/types.js';
import { filterIgnoredDiagnostics } from '../src/utils/filter-diagnostics.js';

const createDiagnostic = (overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  filePath: 'src/App.vue',
  plugin: 'vue',
  rule: 'no-unused-vars',
  severity: 'warning',
  message: 'test message',
  help: 'test help',
  line: 1,
  column: 1,
  category: 'Correctness',
  ...overrides,
});

describe('filterIgnoredDiagnostics', () => {
  it('returns all diagnostics when config has no ignore rules', () => {
    const diagnostics = [createDiagnostic()];
    const config: VueDoctorConfig = {};
    expect(filterIgnoredDiagnostics(diagnostics, config)).toEqual(diagnostics);
  });

  it('filters diagnostics matching ignored rules', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'vue', rule: 'no-unused-vars' }),
      createDiagnostic({ plugin: 'vue', rule: 'require-prop-types' }),
      createDiagnostic({ plugin: 'vue-doctor', rule: 'no-giant-component' }),
    ];
    const config: VueDoctorConfig = {
      ignore: {
        rules: ['vue/no-unused-vars', 'vue/require-prop-types'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('no-giant-component');
  });

  it('filters diagnostics matching ignored file patterns', () => {
    const diagnostics = [
      createDiagnostic({ filePath: 'src/generated/types.vue' }),
      createDiagnostic({ filePath: 'src/generated/api/client.vue' }),
      createDiagnostic({ filePath: 'src/components/Button.vue' }),
    ];
    const config: VueDoctorConfig = {
      ignore: {
        files: ['src/generated/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].filePath).toBe('src/components/Button.vue');
  });

  it('filters by both rules and files together', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'vue', rule: 'no-unused-vars', filePath: 'src/App.vue' }),
      createDiagnostic({ plugin: 'knip', rule: 'exports', filePath: 'src/generated/api.vue' }),
      createDiagnostic({
        plugin: 'vue-doctor',
        rule: 'no-giant-component',
        filePath: 'src/components/App.vue',
      }),
    ];
    const config: VueDoctorConfig = {
      ignore: {
        rules: ['vue/no-unused-vars'],
        files: ['src/generated/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('no-giant-component');
  });

  it('keeps all diagnostics when no rules or files match', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'vue', rule: 'no-unused-vars' }),
      createDiagnostic({ plugin: 'knip', rule: 'exports' }),
    ];
    const config: VueDoctorConfig = {
      ignore: {
        rules: ['nonexistent/rule'],
        files: ['nonexistent/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(2);
  });

  it('filters file paths with ./ prefix against patterns without it', () => {
    const diagnostics = [
      createDiagnostic({ filePath: './resources/js/components/ui/Button.vue' }),
      createDiagnostic({ filePath: './resources/js/marketing/Hero.vue' }),
      createDiagnostic({ filePath: './resources/js/pages/Home.vue' }),
    ];
    const config: VueDoctorConfig = {
      ignore: {
        files: ['resources/js/components/ui/**', 'resources/js/marketing/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].filePath).toBe('./resources/js/pages/Home.vue');
  });

  it('handles knip rule identifiers', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'knip', rule: 'exports' }),
      createDiagnostic({ plugin: 'knip', rule: 'types' }),
      createDiagnostic({ plugin: 'knip', rule: 'files' }),
    ];
    const config: VueDoctorConfig = {
      ignore: {
        rules: ['knip/exports', 'knip/types'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('files');
  });
});
