import { describe, expect, it } from 'vitest';
import type { AngularDoctorConfig, Diagnostic } from '../src/types.js';
import { filterIgnoredDiagnostics } from '../src/utils/filter-diagnostics.js';

const createDiagnostic = (overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  filePath: 'src/app.component.ts',
  plugin: '@angular-eslint',
  rule: 'component-selector',
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
    const config: AngularDoctorConfig = {};
    expect(filterIgnoredDiagnostics(diagnostics, config)).toEqual(diagnostics);
  });

  it('filters diagnostics matching ignored rules', () => {
    const diagnostics = [
      createDiagnostic({ plugin: '@angular-eslint', rule: 'component-selector' }),
      createDiagnostic({ plugin: '@angular-eslint', rule: 'template/accessibility-label-for' }),
      createDiagnostic({ plugin: 'angular-doctor', rule: 'no-giant-component' }),
    ];
    const config: AngularDoctorConfig = {
      ignore: {
        rules: [
          '@angular-eslint/component-selector',
          '@angular-eslint/template/accessibility-label-for',
        ],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('no-giant-component');
  });

  it('filters diagnostics matching ignored file patterns', () => {
    const diagnostics = [
      createDiagnostic({ filePath: 'src/generated/types.ts' }),
      createDiagnostic({ filePath: 'src/generated/api/client.ts' }),
      createDiagnostic({ filePath: 'src/components/button.component.ts' }),
    ];
    const config: AngularDoctorConfig = {
      ignore: {
        files: ['src/generated/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].filePath).toBe('src/components/button.component.ts');
  });

  it('filters by both rules and files together', () => {
    const diagnostics = [
      createDiagnostic({
        plugin: '@angular-eslint',
        rule: 'component-selector',
        filePath: 'src/app.component.ts',
      }),
      createDiagnostic({ plugin: 'knip', rule: 'exports', filePath: 'src/generated/api.ts' }),
      createDiagnostic({
        plugin: 'angular-doctor',
        rule: 'no-giant-component',
        filePath: 'src/components/app.component.ts',
      }),
    ];
    const config: AngularDoctorConfig = {
      ignore: {
        rules: ['@angular-eslint/component-selector'],
        files: ['src/generated/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('no-giant-component');
  });

  it('keeps all diagnostics when no rules or files match', () => {
    const diagnostics = [
      createDiagnostic({ plugin: '@angular-eslint', rule: 'component-selector' }),
      createDiagnostic({ plugin: 'knip', rule: 'exports' }),
    ];
    const config: AngularDoctorConfig = {
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
      createDiagnostic({ filePath: './src/components/ui/button.component.ts' }),
      createDiagnostic({ filePath: './src/marketing/hero.component.ts' }),
      createDiagnostic({ filePath: './src/pages/home.component.ts' }),
    ];
    const config: AngularDoctorConfig = {
      ignore: {
        files: ['src/components/ui/**', 'src/marketing/**'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].filePath).toBe('./src/pages/home.component.ts');
  });

  it('handles knip rule identifiers', () => {
    const diagnostics = [
      createDiagnostic({ plugin: 'knip', rule: 'exports' }),
      createDiagnostic({ plugin: 'knip', rule: 'types' }),
      createDiagnostic({ plugin: 'knip', rule: 'files' }),
    ];
    const config: AngularDoctorConfig = {
      ignore: {
        rules: ['knip/exports', 'knip/types'],
      },
    };

    const filtered = filterIgnoredDiagnostics(diagnostics, config);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].rule).toBe('files');
  });
});
