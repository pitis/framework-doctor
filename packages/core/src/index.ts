export {
  ANALYTICS_CONFIG_KEY,
  ANALYTICS_OPTION_DESCRIPTION,
  ANALYTICS_OPTION_FLAGS,
  addAnalyticsOption,
} from './cli-options.js';
export {
  getOrCreateInstallId,
  readGlobalConfig,
  writeGlobalConfig,
  type FrameworkDoctorConfig,
} from './global-config.js';
export {
  isAutomatedEnvironment,
  maybePromptAnalyticsConsent,
  sendScanEvent,
  shouldSendAnalytics,
  type TelemetryEventPayload,
  type TelemetryFlags,
} from './telemetry.js';
