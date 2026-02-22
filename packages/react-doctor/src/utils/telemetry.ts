import {
  maybePromptAnalyticsConsent as coreMaybePromptAnalyticsConsent,
  sendScanEvent as coreSendScanEvent,
  shouldSendAnalytics as coreShouldSendAnalytics,
  highlighter,
  logger,
  type TelemetryEventPayload,
} from '@framework-doctor/core';
import type { ProjectInfo, ScoreResult } from '../types.js';
import { prompts } from './prompts.js';

export const shouldSendAnalytics = coreShouldSendAnalytics;

export const maybePromptAnalyticsConsent = async (shouldSkipPrompts: boolean): Promise<boolean> =>
  coreMaybePromptAnalyticsConsent(shouldSkipPrompts, async () => {
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
    return Boolean(analyticsEnabled);
  });

const buildPayload = (
  projectInfo: ProjectInfo,
  scoreResult: ScoreResult,
  diagnosticCount: number,
  options: { isDiffMode: boolean; cliVersion: string },
): TelemetryEventPayload => ({
  doctor_family: 'react',
  framework: projectInfo.framework,
  score: scoreResult.score,
  diagnostic_count: diagnosticCount,
  has_typescript: projectInfo.hasTypeScript,
  is_diff_mode: options.isDiffMode,
  cli_version: options.cliVersion,
});

export const sendScanEvent = (
  telemetryUrl: string,
  projectInfo: ProjectInfo,
  scoreResult: ScoreResult,
  diagnosticCount: number,
  options: { isDiffMode: boolean; cliVersion: string },
): void =>
  coreSendScanEvent(telemetryUrl, buildPayload(projectInfo, scoreResult, diagnosticCount, options));
