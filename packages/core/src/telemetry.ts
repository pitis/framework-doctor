import { TELEMETRY_FETCH_TIMEOUT_MS } from './constants.js';
import { getOrCreateInstallId, readGlobalConfig, writeGlobalConfig } from './global-config.js';

const AUTOMATED_ENVIRONMENT_VARIABLES = [
  'CI',
  'CLAUDECODE',
  'CURSOR_AGENT',
  'CODEX_CI',
  'OPENCODE',
  'AMP_HOME',
];

export const isAutomatedEnvironment = (): boolean =>
  AUTOMATED_ENVIRONMENT_VARIABLES.some((envVariable) => Boolean(process.env[envVariable]));

export interface TelemetryFlags {
  analytics: boolean;
  yes: boolean;
}

export const shouldSendAnalytics = (
  flags: TelemetryFlags,
  userConfigAnalytics: boolean | undefined,
  isAutomated: boolean,
): boolean => {
  if (process.env.DO_NOT_TRACK === '1') return false;
  if (isAutomated) return false;
  if (flags.yes) return false;
  if (!flags.analytics) return false;
  if (userConfigAnalytics === false) return false;
  const globalConfig = readGlobalConfig();
  return Boolean(globalConfig.analyticsEnabled);
};

export const maybePromptAnalyticsConsent = async (
  shouldSkipPrompts: boolean,
  promptUser: () => Promise<boolean>,
): Promise<boolean> => {
  if (shouldSkipPrompts) return false;
  if (process.env.DO_NOT_TRACK === '1') return false;

  const config = readGlobalConfig();
  if (config.analyticsEnabled !== undefined) return config.analyticsEnabled;

  const enabled = await promptUser();
  writeGlobalConfig({ ...config, analyticsEnabled: enabled });
  return Boolean(enabled);
};

const getScoreBucket = (score: number): string => {
  if (score < 50) return '0-50';
  if (score < 75) return '50-75';
  return '75-100';
};

export interface TelemetryEventPayload {
  framework: string;
  score: number;
  diagnostic_count: number;
  has_typescript: boolean;
  is_diff_mode: boolean;
  cli_version: string;
}

export const sendScanEvent = (telemetryUrl: string, payload: TelemetryEventPayload): void => {
  const fullPayload = {
    ...payload,
    score_bucket: getScoreBucket(payload.score),
    install_id: getOrCreateInstallId(),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEMETRY_FETCH_TIMEOUT_MS);

  fetch(telemetryUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullPayload),
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => clearTimeout(timeout));
};
