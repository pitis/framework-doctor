export { calculateScore } from './calculate-score.js';
export {
  ANALYTICS_CONFIG_KEY,
  ANALYTICS_OPTION_DESCRIPTION,
  ANALYTICS_OPTION_FLAGS,
  addAnalyticsOption,
} from './cli-options.js';
export {
  ERROR_RULE_PENALTY,
  ERROR_VOLUME_COEFFICIENT,
  MILLISECONDS_PER_SECOND,
  PERFECT_SCORE,
  SCORE_BAR_WIDTH_CHARS,
  SCORE_BLOCKING_CHECK_CAP,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  SPREAD_PENALTY_MAX,
  SUMMARY_BOX_HORIZONTAL_PADDING_CHARS,
  SUMMARY_BOX_OUTER_INDENT_CHARS,
  WARNING_RULE_PENALTY,
  WARNING_VOLUME_COEFFICIENT,
} from './constants.js';
export {
  SOURCE_FILE_PATTERN_JS_TS,
  SOURCE_FILE_PATTERN_REACT,
  SOURCE_FILE_PATTERN_SVELTE,
  SOURCE_FILE_PATTERN_VUE,
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
  NO_V_HTML_RULE,
  SOURCE_FILE_PATTERN_WITH_VUE,
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
export type {
  BaseDoctorConfig,
  Diagnostic,
  DiffInfo,
  IgnoreConfig,
  ScoreBreakdown,
  ScoreGuardrailInput,
  ScoreResult,
} from './types.js';
export {
  buildCountsSummaryLine,
  buildScoreBar,
  buildScoreBreakdownLines,
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
export {
  compileGlobPattern,
  findMonorepoRoot,
  groupBy,
  indentMultilineText,
  isMonorepoRoot,
  matchGlobPattern,
  readJson,
} from './utils/index.js';
