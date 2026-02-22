import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME_DIRECTORY = homedir();
const CONFIG_DIRECTORY = join(HOME_DIRECTORY, '.framework-doctor');
const CONFIG_FILE = join(CONFIG_DIRECTORY, 'config.json');

export interface FrameworkDoctorConfig {
  skillPromptDismissed?: boolean;
  analyticsEnabled?: boolean;
  installId?: string;
}

export const getOrCreateInstallId = (): string => {
  const config = readGlobalConfig();
  const existingId = config.installId;
  if (existingId) return existingId;
  const installId = crypto.randomUUID();
  writeGlobalConfig({ ...config, installId });
  return installId;
};

export const readGlobalConfig = (): FrameworkDoctorConfig => {
  try {
    if (!existsSync(CONFIG_FILE)) return {};
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as FrameworkDoctorConfig;
  } catch {
    return {};
  }
};

export const writeGlobalConfig = (config: FrameworkDoctorConfig): void => {
  try {
    mkdirSync(CONFIG_DIRECTORY, { recursive: true });
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch {}
};
