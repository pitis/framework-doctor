import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { discoverProject, listWorkspacePackages } from '../src/utils/discover-project.js';

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, 'fixtures');

describe('discoverProject', () => {
  it('detects Angular version from package.json', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'basic-angular'));
    expect(projectInfo.angularVersion).toBe('^19.0.0');
  });

  it('detects TypeScript when tsconfig.json exists', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'basic-angular'));
    expect(projectInfo.hasTypeScript).toBe(true);
  });

  it('detects Angular version from peerDependencies', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'component-library'));
    expect(projectInfo.angularVersion).toBe('^19.0.0 || ^18.0.0');
  });

  it('throws when package.json is missing', () => {
    expect(() => discoverProject('/nonexistent/path')).toThrow('No package.json found');
  });
});

describe('listWorkspacePackages', () => {
  it('resolves nested workspace patterns like apps/*/ClientApp', () => {
    const packages = listWorkspacePackages(path.join(FIXTURES_DIRECTORY, 'nested-workspaces'));
    const packageNames = packages.map((workspacePackage) => workspacePackage.name);

    expect(packageNames).toContain('my-app-client');
    expect(packageNames).toContain('ui');
    expect(packages).toHaveLength(2);
  });
});
