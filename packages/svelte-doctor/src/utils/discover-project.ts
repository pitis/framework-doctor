import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { ProjectInfo, SvelteFramework } from '../types.js';
import { readJson } from './read-json.js';

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const SOURCE_FILE_PATTERN = /\.(svelte|ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

const collectDependencies = (packageJson: PackageJson): Record<string, string> => ({
  ...packageJson.peerDependencies,
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
});

const countSourceFiles = (rootDirectory: string): number => {
  const gitOutput = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: rootDirectory,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (gitOutput.status !== 0 || gitOutput.error) return 0;

  return gitOutput.stdout
    .split('\n')
    .filter((relativePath) => relativePath.length > 0 && SOURCE_FILE_PATTERN.test(relativePath))
    .length;
};

const detectFramework = (dependencies: Record<string, string>): SvelteFramework =>
  dependencies['@sveltejs/kit'] ? 'sveltekit' : 'svelte';

export const discoverProject = (directory: string): ProjectInfo => {
  const packageJsonPath = path.join(directory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in ${directory}`);
  }

  const packageJson = readJson<PackageJson>(packageJsonPath);
  const dependencies = collectDependencies(packageJson);
  const svelteVersion = dependencies.svelte ?? null;
  const framework = detectFramework(dependencies);

  return {
    rootDirectory: directory,
    projectName: packageJson.name ?? path.basename(directory),
    svelteVersion,
    framework,
    hasTypeScript: fs.existsSync(path.join(directory, 'tsconfig.json')),
    sourceFileCount: countSourceFiles(directory),
  };
};
