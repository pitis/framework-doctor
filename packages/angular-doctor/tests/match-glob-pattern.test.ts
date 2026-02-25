import { matchGlobPattern } from '@framework-doctor/core';
import { describe, expect, it } from 'vitest';

describe('matchGlobPattern', () => {
  it('matches exact file paths', () => {
    expect(matchGlobPattern('src/app.component.ts', 'src/app.component.ts')).toBe(true);
    expect(matchGlobPattern('src/app.component.ts', 'src/other.component.ts')).toBe(false);
  });

  it('matches single wildcard for filenames', () => {
    expect(matchGlobPattern('src/app.component.html', 'src/*.html')).toBe(true);
    expect(matchGlobPattern('src/utils.ts', 'src/*.html')).toBe(false);
    expect(matchGlobPattern('src/nested/app.component.html', 'src/*.html')).toBe(false);
  });

  it('matches double wildcard at the end', () => {
    expect(matchGlobPattern('src/generated/foo.ts', 'src/generated/**')).toBe(true);
    expect(matchGlobPattern('src/generated/bar/baz.ts', 'src/generated/**')).toBe(true);
    expect(matchGlobPattern('src/other/foo.ts', 'src/generated/**')).toBe(false);
  });

  it('matches double wildcard with trailing slash and filename', () => {
    expect(matchGlobPattern('src/foo/test.ts', 'src/**/test.ts')).toBe(true);
    expect(matchGlobPattern('src/foo/bar/test.ts', 'src/**/test.ts')).toBe(true);
    expect(matchGlobPattern('src/test.ts', 'src/**/test.ts')).toBe(true);
  });

  it('matches double wildcard at the start', () => {
    expect(matchGlobPattern('src/components/button.component.ts', '**/*.ts')).toBe(true);
    expect(matchGlobPattern('app.component.ts', '**/*.ts')).toBe(true);
    expect(matchGlobPattern('deep/nested/path/file.ts', '**/*.ts')).toBe(true);
    expect(matchGlobPattern('file.js', '**/*.ts')).toBe(false);
  });

  it('matches question mark as single character', () => {
    expect(matchGlobPattern('src/a.ts', 'src/?.ts')).toBe(true);
    expect(matchGlobPattern('src/ab.ts', 'src/?.ts')).toBe(false);
  });

  it('escapes regex special characters in patterns', () => {
    expect(matchGlobPattern('src/file.test.ts', 'src/*.test.ts')).toBe(true);
    expect(matchGlobPattern('src/filetestts', 'src/*.test.ts')).toBe(false);
  });

  it('normalizes backslashes to forward slashes', () => {
    expect(matchGlobPattern('src\\generated\\foo.ts', 'src/generated/**')).toBe(true);
  });
});
