import fs from 'node:fs';
import path from 'node:path';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const loadConfig = <T extends object>(
  rootDirectory: string,
  configFilename: string,
  packageJsonKey: string,
): T | null => {
  const configPath = path.join(rootDirectory, configFilename);
  if (fs.existsSync(configPath)) {
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (!isPlainObject(parsed)) return null;
      return parsed as T;
    } catch {
      return null;
    }
  }

  const packageJsonPath = path.join(rootDirectory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return null;

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as Record<
      string,
      unknown
    >;
    const config = packageJson[packageJsonKey];
    if (!isPlainObject(config)) return null;
    return config as T;
  } catch {
    return null;
  }
};

const UNIFIED_CONFIG_FILENAME = 'framework-doctor.config.json';
const UNIFIED_PACKAGE_JSON_KEY = 'frameworkDoctor';

const SHARED_OPTIONS = ['ignore', 'verbose', 'diff', 'analytics'] as const;

export const loadUnifiedConfig = (rootDirectory: string): Record<string, unknown> | null => {
  const unified = loadConfig<Record<string, unknown>>(
    rootDirectory,
    UNIFIED_CONFIG_FILENAME,
    UNIFIED_PACKAGE_JSON_KEY,
  );
  return unified;
};

export const loadConfigWithUnified = <T extends object>(
  rootDirectory: string,
  configFilename: string,
  packageJsonKey: string,
  unifiedFrameworkKey: string,
): T | null => {
  const frameworkConfig = loadConfig<T>(rootDirectory, configFilename, packageJsonKey);
  const unified = loadUnifiedConfig(rootDirectory);
  if (!frameworkConfig && !unified) return null;

  const merged: Record<string, unknown> = {};
  if (unified) {
    for (const key of SHARED_OPTIONS) {
      if (key in unified) merged[key] = unified[key];
    }
    const frameworkSection = unified[unifiedFrameworkKey];
    if (isPlainObject(frameworkSection)) {
      Object.assign(merged, frameworkSection);
    }
  }
  if (frameworkConfig && typeof frameworkConfig === 'object') {
    Object.assign(merged, frameworkConfig as Record<string, unknown>);
  }
  return Object.keys(merged).length > 0 ? (merged as T) : null;
};
