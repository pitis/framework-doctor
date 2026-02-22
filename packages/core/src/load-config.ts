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
