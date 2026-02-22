import { readJson } from '@framework-doctor/core';
import type { PackageJson } from '../types.js';

export const readPackageJson = (packageJsonPath: string): PackageJson =>
  readJson<PackageJson>(packageJsonPath);
