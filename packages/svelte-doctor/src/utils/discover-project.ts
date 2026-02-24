import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { PackageJson, ProjectInfo, SvelteFramework, WorkspacePackage } from '../types.js';
import { readPackageJson } from './read-package-json.js';

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

const hasSvelteDependency = (packageJson: PackageJson): boolean => {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  };
  return Object.keys(deps).some((name) => name === 'svelte' || name === '@sveltejs/kit');
};

const parsePnpmWorkspacePatterns = (rootDirectory: string): string[] => {
  const workspacePath = path.join(rootDirectory, 'pnpm-workspace.yaml');
  if (!fs.existsSync(workspacePath)) return [];

  const content = fs.readFileSync(workspacePath, 'utf-8');
  const patterns: string[] = [];
  let isInsidePackagesBlock = false;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === 'packages:') {
      isInsidePackagesBlock = true;
      continue;
    }
    if (isInsidePackagesBlock && trimmed.startsWith('-')) {
      patterns.push(trimmed.replace(/^-\s*/, '').replace(/["']/g, ''));
    } else if (isInsidePackagesBlock && trimmed.length > 0 && !trimmed.startsWith('#')) {
      isInsidePackagesBlock = false;
    }
  }

  return patterns;
};

const getWorkspacePatterns = (rootDirectory: string, packageJson: PackageJson): string[] => {
  const pnpmPatterns = parsePnpmWorkspacePatterns(rootDirectory);
  if (pnpmPatterns.length > 0) return pnpmPatterns;

  if (Array.isArray(packageJson.workspaces)) {
    return packageJson.workspaces;
  }

  if (packageJson.workspaces?.packages) {
    return packageJson.workspaces.packages;
  }

  return [];
};

const resolveWorkspaceDirectories = (rootDirectory: string, pattern: string): string[] => {
  const cleanPattern = pattern.replace(/["']/g, '').replace(/\/\*\*$/, '/*');

  if (!cleanPattern.includes('*')) {
    const directoryPath = path.join(rootDirectory, cleanPattern);
    if (fs.existsSync(directoryPath) && fs.existsSync(path.join(directoryPath, 'package.json'))) {
      return [directoryPath];
    }
    return [];
  }

  const wildcardIndex = cleanPattern.indexOf('*');
  const baseDirectory = path.join(rootDirectory, cleanPattern.slice(0, wildcardIndex));
  const suffixAfterWildcard = cleanPattern.slice(wildcardIndex + 1);

  if (!fs.existsSync(baseDirectory) || !fs.statSync(baseDirectory).isDirectory()) {
    return [];
  }

  return fs
    .readdirSync(baseDirectory)
    .map((entry) => path.join(baseDirectory, entry, suffixAfterWildcard))
    .filter(
      (entryPath) =>
        fs.existsSync(entryPath) &&
        fs.statSync(entryPath).isDirectory() &&
        fs.existsSync(path.join(entryPath, 'package.json')),
    );
};

export const discoverSvelteSubprojects = (rootDirectory: string): WorkspacePackage[] => {
  if (!fs.existsSync(rootDirectory) || !fs.statSync(rootDirectory).isDirectory()) return [];

  const entries = fs.readdirSync(rootDirectory, { withFileTypes: true });
  const packages: WorkspacePackage[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    const subdirectory = path.join(rootDirectory, entry.name);
    const packageJsonPath = path.join(subdirectory, 'package.json');
    if (!fs.existsSync(packageJsonPath)) continue;

    const packageJson = readPackageJson(packageJsonPath);
    if (!hasSvelteDependency(packageJson)) continue;

    const name = packageJson.name ?? entry.name;
    packages.push({ name, directory: subdirectory });
  }

  return packages;
};

export const listWorkspacePackages = (rootDirectory: string): WorkspacePackage[] => {
  const packageJsonPath = path.join(rootDirectory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return [];

  const packageJson = readPackageJson(packageJsonPath);
  const patterns = getWorkspacePatterns(rootDirectory, packageJson);
  if (patterns.length === 0) return [];

  const packages: WorkspacePackage[] = [];

  for (const pattern of patterns) {
    const directories = resolveWorkspaceDirectories(rootDirectory, pattern);
    for (const workspaceDirectory of directories) {
      const workspacePackageJson = readPackageJson(path.join(workspaceDirectory, 'package.json'));

      if (!hasSvelteDependency(workspacePackageJson)) continue;

      const name = workspacePackageJson.name ?? path.basename(workspaceDirectory);
      packages.push({ name, directory: workspaceDirectory });
    }
  }

  return packages;
};

export const discoverProject = (directory: string): ProjectInfo => {
  const packageJsonPath = path.join(directory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in ${directory}`);
  }

  const packageJson = readPackageJson(packageJsonPath);
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
