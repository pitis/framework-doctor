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
