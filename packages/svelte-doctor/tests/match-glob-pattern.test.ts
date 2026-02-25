import { matchGlobPattern } from '@framework-doctor/core';
import { describe, expect, it } from 'vitest';

describe('matchGlobPattern', () => {
  it('matches exact file paths', () => {
    expect(matchGlobPattern('src/app.svelte', 'src/app.svelte')).toBe(true);
    expect(matchGlobPattern('src/app.svelte', 'src/other.svelte')).toBe(false);
  });

  it('matches single wildcard for filenames', () => {
    expect(matchGlobPattern('src/app.svelte', 'src/*.svelte')).toBe(true);
    expect(matchGlobPattern('src/utils.ts', 'src/*.svelte')).toBe(false);
    expect(matchGlobPattern('src/nested/app.svelte', 'src/*.svelte')).toBe(false);
  });

  it('matches double wildcard at the end', () => {
    expect(matchGlobPattern('src/generated/foo.svelte', 'src/generated/**')).toBe(true);
    expect(matchGlobPattern('src/generated/bar/baz.svelte', 'src/generated/**')).toBe(true);
    expect(matchGlobPattern('src/other/foo.svelte', 'src/generated/**')).toBe(false);
  });

  it('matches double wildcard with trailing slash and filename', () => {
    expect(matchGlobPattern('src/foo/test.ts', 'src/**/test.ts')).toBe(true);
    expect(matchGlobPattern('src/foo/bar/test.ts', 'src/**/test.ts')).toBe(true);
    expect(matchGlobPattern('src/test.ts', 'src/**/test.ts')).toBe(true);
  });

  it('matches double wildcard at the start', () => {
    expect(matchGlobPattern('src/components/Button.svelte', '**/*.svelte')).toBe(true);
    expect(matchGlobPattern('Button.svelte', '**/*.svelte')).toBe(true);
    expect(matchGlobPattern('deep/nested/path/file.svelte', '**/*.svelte')).toBe(true);
    expect(matchGlobPattern('file.ts', '**/*.svelte')).toBe(false);
  });

  it('matches question mark as single character', () => {
    expect(matchGlobPattern('src/a.svelte', 'src/?.svelte')).toBe(true);
    expect(matchGlobPattern('src/ab.svelte', 'src/?.svelte')).toBe(false);
  });

  it('escapes regex special characters in patterns', () => {
    expect(matchGlobPattern('src/file.test.svelte', 'src/*.test.svelte')).toBe(true);
    expect(matchGlobPattern('src/filetestvelte', 'src/*.test.svelte')).toBe(false);
  });

  it('normalizes backslashes to forward slashes', () => {
    expect(matchGlobPattern('src\\generated\\foo.svelte', 'src/generated/**')).toBe(true);
  });
});
