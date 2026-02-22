export { calculateScore } from './calculate-score.js';
export {
  ANALYTICS_CONFIG_KEY,
  ANALYTICS_OPTION_DESCRIPTION,
  ANALYTICS_OPTION_FLAGS,
  addAnalyticsOption,
} from './cli-options.js';
export {
  PERFECT_SCORE,
  SCORE_BAR_WIDTH_CHARS,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
} from './constants.js';
export {
  SOURCE_FILE_PATTERN_JS_TS,
  SOURCE_FILE_PATTERN_REACT,
  SOURCE_FILE_PATTERN_SVELTE,
  filterSourceFiles,
  getDiffInfo,
} from './get-diff-files.js';
export {
  getOrCreateInstallId,
  readGlobalConfig,
  writeGlobalConfig,
  type FrameworkDoctorConfig,
} from './global-config.js';
export { loadConfig } from './load-config.js';
export {
  DANGEROUSLY_SET_INNER_HTML_RULE,
  NO_AT_HTML_RULE,
  UNIVERSAL_SECURITY_RULES,
  getFilesToScan,
  runSecurityScan,
} from './security/index.js';
export type { RunSecurityScanOptions, SecurityRule } from './security/index.js';
export {
  isAutomatedEnvironment,
  maybePromptAnalyticsConsent,
  sendScanEvent,
  shouldSendAnalytics,
  type TelemetryEventPayload,
  type TelemetryFlags,
} from './telemetry.js';
export type { Diagnostic, DiffInfo, ScoreResult } from './types.js';
export {
  buildCountsSummaryLine,
  buildScoreBar,
  colorizeByScore,
  createFramedLine,
  formatElapsedTime,
  getDoctorFace,
  highlighter,
  logger,
  printFramedBox,
  renderFramedBoxString,
  spinner,
} from './ui/index.js';
export type { FramedLine } from './ui/index.js';
export { groupBy, indentMultilineText } from './utils/index.js';
