import { readJson } from './utils/read-json.js';

export interface PackageJsonLike {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

export const readPackageJson = (packageJsonPath: string): PackageJsonLike =>
  readJson<PackageJsonLike>(packageJsonPath);
