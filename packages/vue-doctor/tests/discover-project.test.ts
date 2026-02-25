import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { discoverProject, listWorkspacePackages } from '../src/utils/discover-project.js';

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, 'fixtures');
const VALID_FRAMEWORKS = ['vue', 'nuxt'] as const;

describe('discoverProject', () => {
  it('detects Vue version from package.json', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'basic-vue'));
    expect(projectInfo.vueVersion).toBe('^3.0.0');
  });

  it('returns a valid framework', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'basic-vue'));
    expect(VALID_FRAMEWORKS).toContain(projectInfo.framework);
  });

  it('detects TypeScript when tsconfig.json exists', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'basic-vue'));
    expect(projectInfo.hasTypeScript).toBe(true);
  });

  it('detects framework as nuxt when nuxt dependency exists', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'nuxt-app'));
    expect(projectInfo.framework).toBe('nuxt');
  });

  it('detects Vue version from peerDependencies', () => {
    const projectInfo = discoverProject(path.join(FIXTURES_DIRECTORY, 'component-library'));
    expect(projectInfo.vueVersion).toBe('^3.0.0 || ^2.0.0');
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
