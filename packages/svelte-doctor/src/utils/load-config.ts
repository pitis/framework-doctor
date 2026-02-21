import fs from 'node:fs';
import path from 'node:path';
import type { SvelteDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'svelte-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'svelteDoctor';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const loadConfig = (rootDirectory: string): SvelteDoctorConfig | null => {
  const configPath = path.join(rootDirectory, CONFIG_FILENAME);
  if (fs.existsSync(configPath)) {
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (!isPlainObject(parsed)) return null;
      return parsed as SvelteDoctorConfig;
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
    const config = packageJson[PACKAGE_JSON_CONFIG_KEY];
    if (!isPlainObject(config)) return null;
    return config as SvelteDoctorConfig;
  } catch {
    return null;
  }
};
