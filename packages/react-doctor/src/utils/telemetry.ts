import { TELEMETRY_FETCH_TIMEOUT_MS } from '../constants.js';
import type { ProjectInfo, ReactDoctorConfig, ScoreResult } from '../types.js';
import { getOrCreateInstallId, readGlobalConfig, writeGlobalConfig } from './global-config.js';
import { highlighter } from './highlighter.js';
import { logger } from './logger.js';
import { prompts } from './prompts.js';

interface TelemetryFlags {
  analytics: boolean;
  yes: boolean;
}

export const shouldSendAnalytics = (
  flags: TelemetryFlags,
  userConfig: ReactDoctorConfig | null,
  isAutomated: boolean,
): boolean => {
  if (process.env.DO_NOT_TRACK === '1') return false;
  if (isAutomated) return false;
  if (flags.yes) return false;
  if (!flags.analytics) return false;
  if (userConfig?.analytics === false) return false;
  const globalConfig = readGlobalConfig();
  return Boolean(globalConfig.analyticsEnabled);
};

export const maybePromptAnalyticsConsent = async (shouldSkipPrompts: boolean): Promise<boolean> => {
  if (shouldSkipPrompts) return false;
  if (process.env.DO_NOT_TRACK === '1') return false;

  const config = readGlobalConfig();
  if (config.analyticsEnabled !== undefined) return config.analyticsEnabled;

  logger.break();
  logger.log(`${highlighter.info('?')} Help improve react-doctor?`);
  logger.dim('   Anonymous usage (framework, score range). No code or paths sent.');
  logger.break();

  const { analyticsEnabled } = await prompts({
    type: 'confirm',
    name: 'analyticsEnabled',
    message: 'Share anonymous analytics?',
    initial: true,
  });

  writeGlobalConfig({ ...config, analyticsEnabled });
  return Boolean(analyticsEnabled);
};

const getScoreBucket = (score: number): string => {
  if (score < 50) return '0-50';
  if (score < 75) return '50-75';
  return '75-100';
};

export const sendScanEvent = (
  telemetryUrl: string,
  projectInfo: ProjectInfo,
  scoreResult: ScoreResult,
  diagnosticCount: number,
  options: { isDiffMode: boolean; cliVersion: string },
): void => {
  const payload = {
    framework: projectInfo.framework,
    score: scoreResult.score,
    score_bucket: getScoreBucket(scoreResult.score),
    diagnostic_count: diagnosticCount,
    has_typescript: projectInfo.hasTypeScript,
    is_diff_mode: options.isDiffMode,
    cli_version: options.cliVersion,
    install_id: getOrCreateInstallId(),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEMETRY_FETCH_TIMEOUT_MS);

  fetch(telemetryUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => clearTimeout(timeout));
};
