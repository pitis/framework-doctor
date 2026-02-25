import { describe, expect, it } from 'vitest';
import type { Diagnostic, SvelteDoctorConfig } from '../src/types.js';
import { filterIgnoredDiagnostics } from '../src/utils/filter-diagnostics.js';

const createDiagnostic = (overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  filePath: 'src/App.svelte',
  plugin: 'svelte',
  rule: 'no-at-html-tags',
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
    const config: SvelteDoctorConfig = {};
    expect(filterIgnoredDiagnostics(diagnostics, config)).toEqual(diagnostics);
  });

  it('filters diagnostics matching ignored rules', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'svelte', rule: 'no-at-html-tags' }),
      createDiagnostic({ plugin: 'svelte', rule: 'valid-compile' }),
      createDiagnostic({ plugin: 'svelte-doctor', rule: 'no-giant-component' }),
    ];
    const config: SvelteDoctorConfig = {
      ignore: {
        rules: ['svelte/no-at-html-tags', 'svelte/valid-compile'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('no-giant-component');
  });

  it('filters diagnostics matching ignored file patterns', () => {
    const diagnostics = [
      createDiagnostic({ filePath: 'src/generated/types.svelte' }),
      createDiagnostic({ filePath: 'src/generated/api/client.svelte' }),
      createDiagnostic({ filePath: 'src/components/Button.svelte' }),
    ];
    const config: SvelteDoctorConfig = {
      ignore: {
        files: ['src/generated/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].filePath).toBe('src/components/Button.svelte');
  });

  it('filters by both rules and files together', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'svelte', rule: 'no-at-html-tags', filePath: 'src/App.svelte' }),
      createDiagnostic({ plugin: 'knip', rule: 'exports', filePath: 'src/generated/api.svelte' }),
      createDiagnostic({
        plugin: 'svelte-doctor',
        rule: 'no-giant-component',
        filePath: 'src/components/App.svelte',
      }),
    ];
    const config: SvelteDoctorConfig = {
      ignore: {
        rules: ['svelte/no-at-html-tags'],
        files: ['src/generated/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('no-giant-component');
  });

  it('keeps all diagnostics when no rules or files match', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'svelte', rule: 'no-at-html-tags' }),
      createDiagnostic({ plugin: 'knip', rule: 'exports' }),
    ];
    const config: SvelteDoctorConfig = {
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
      createDiagnostic({ filePath: './resources/js/components/ui/Button.svelte' }),
      createDiagnostic({ filePath: './resources/js/marketing/Hero.svelte' }),
      createDiagnostic({ filePath: './resources/js/pages/Home.svelte' }),
    ];
    const config: SvelteDoctorConfig = {
      ignore: {
        files: ['resources/js/components/ui/**', 'resources/js/marketing/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].filePath).toBe('./resources/js/pages/Home.svelte');
  });

  it('handles knip rule identifiers', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'knip', rule: 'exports' }),
      createDiagnostic({ plugin: 'knip', rule: 'types' }),
      createDiagnostic({ plugin: 'knip', rule: 'files' }),
    ];
    const config: SvelteDoctorConfig = {
      ignore: {
        rules: ['knip/exports', 'knip/types'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('files');
  });
});
