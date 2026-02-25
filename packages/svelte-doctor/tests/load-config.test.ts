import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/utils/load-config.js';

const tempRootDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-doctor-config-test-'));

afterAll(() => {
  fs.rmSync(tempRootDirectory, { recursive: true, force: true });
});

describe('loadConfig', () => {
  describe('svelte-doctor.config.json', () => {
    let configDirectory: string;

    beforeAll(() => {
      configDirectory = path.join(tempRootDirectory, 'with-config-file');
      fs.mkdirSync(configDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(configDirectory, 'svelte-doctor.config.json'),
        JSON.stringify({
          ignore: {
            rules: ['svelte/no-at-html-tags', 'knip/exports'],
            files: ['src/generated/**'],
          },
        }),
      );
    });

    it('loads config from svelte-doctor.config.json', () => {
      const config = loadConfig(configDirectory);
      expect(config).toEqual({
        ignore: {
          rules: ['svelte/no-at-html-tags', 'knip/exports'],
          files: ['src/generated/**'],
        },
      });
    });
  });

  describe('package.json svelteDoctor key', () => {
    let packageJsonDirectory: string;

    beforeAll(() => {
      packageJsonDirectory = path.join(tempRootDirectory, 'with-package-json-config');
      fs.mkdirSync(packageJsonDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(packageJsonDirectory, 'package.json'),
        JSON.stringify({
          name: 'test-project',
          svelteDoctor: {
            ignore: {
              rules: ['svelte/valid-compile'],
            },
          },
        }),
      );
    });

    it('loads config from package.json svelteDoctor key', () => {
      const config = loadConfig(packageJsonDirectory);
      expect(config).toEqual({
        ignore: {
          rules: ['svelte/valid-compile'],
        },
      });
    });
  });

  describe('config file takes precedence', () => {
    let precedenceDirectory: string;

    beforeAll(() => {
      precedenceDirectory = path.join(tempRootDirectory, 'precedence');
      fs.mkdirSync(precedenceDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(precedenceDirectory, 'svelte-doctor.config.json'),
        JSON.stringify({ ignore: { rules: ['from-config-file'] } }),
      );
      fs.writeFileSync(
        path.join(precedenceDirectory, 'package.json'),
        JSON.stringify({
          name: 'test',
          svelteDoctor: { ignore: { rules: ['from-package-json'] } },
        }),
      );
    });

    it('prefers svelte-doctor.config.json over package.json', () => {
      const config = loadConfig(precedenceDirectory);
      expect(config?.ignore?.rules).toEqual(['from-config-file']);
    });
  });

  describe('no config', () => {
    let emptyDirectory: string;

    beforeAll(() => {
      emptyDirectory = path.join(tempRootDirectory, 'no-config');
      fs.mkdirSync(emptyDirectory, { recursive: true });
    });

    it('returns null when no config is found', () => {
      const config = loadConfig(emptyDirectory);
      expect(config).toBeNull();
    });
  });

  describe('scan options in config', () => {
    let optionsDirectory: string;

    beforeAll(() => {
      optionsDirectory = path.join(tempRootDirectory, 'with-scan-options');
      fs.mkdirSync(optionsDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(optionsDirectory, 'svelte-doctor.config.json'),
        JSON.stringify({
          ignore: { rules: ['svelte/no-at-html-tags'] },
          lint: true,
          deadCode: false,
          verbose: true,
          diff: 'main',
        }),
      );
    });

    it('loads scan options alongside ignore config', () => {
      const config = loadConfig(optionsDirectory);
      expect(config).toEqual({
        ignore: { rules: ['svelte/no-at-html-tags'] },
        lint: true,
        deadCode: false,
        verbose: true,
        diff: 'main',
      });
    });

    it('loads diff as boolean', () => {
      const boolDiffDirectory = path.join(tempRootDirectory, 'with-bool-diff');
      fs.mkdirSync(boolDiffDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(boolDiffDirectory, 'svelte-doctor.config.json'),
        JSON.stringify({ diff: true }),
      );
      const config = loadConfig(boolDiffDirectory);
      expect(config?.diff).toBe(true);
    });
  });

  describe('invalid config', () => {
    let invalidJsonDirectory: string;
    let nonObjectDirectory: string;

    beforeAll(() => {
      invalidJsonDirectory = path.join(tempRootDirectory, 'invalid-json');
      fs.mkdirSync(invalidJsonDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(invalidJsonDirectory, 'svelte-doctor.config.json'),
        'not valid json{{{',
      );

      nonObjectDirectory = path.join(tempRootDirectory, 'non-object-config');
      fs.mkdirSync(nonObjectDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(nonObjectDirectory, 'svelte-doctor.config.json'),
        JSON.stringify([1, 2, 3]),
      );
    });

    it('returns null for malformed JSON', () => {
      const config = loadConfig(invalidJsonDirectory);
      expect(config).toBeNull();
    });

    it('returns null when config is not an object', () => {
      const config = loadConfig(nonObjectDirectory);
      expect(config).toBeNull();
    });

    it('ignores non-object svelteDoctor key in package.json', () => {
      const arrayConfigDirectory = path.join(tempRootDirectory, 'array-pkg-config');
      fs.mkdirSync(arrayConfigDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(arrayConfigDirectory, 'package.json'),
        JSON.stringify({ name: 'test', svelteDoctor: 'not-an-object' }),
      );
      const config = loadConfig(arrayConfigDirectory);
      expect(config).toBeNull();
    });
  });
});
