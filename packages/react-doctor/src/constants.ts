export {
  ERROR_RULE_PENALTY,
  MILLISECONDS_PER_SECOND,
  PERFECT_SCORE,
  SCORE_BAR_WIDTH_CHARS,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  SUMMARY_BOX_HORIZONTAL_PADDING_CHARS,
  SUMMARY_BOX_OUTER_INDENT_CHARS,
  WARNING_RULE_PENALTY,
} from '@framework-doctor/core';

export const SOURCE_FILE_PATTERN = /\.(tsx?|jsx?)$/;

export const JSX_FILE_PATTERN = /\.(tsx|jsx)$/;

export const ERROR_PREVIEW_LENGTH_CHARS = 200;

export const FETCH_TIMEOUT_MS = 10_000;

export const GIT_LS_FILES_MAX_BUFFER_BYTES = 50 * 1024 * 1024;

// HACK: Windows CreateProcessW limits total command-line length to 32,767 chars.
// Use a conservative threshold to leave room for the executable path and quoting overhead.
export const SPAWN_ARGS_MAX_LENGTH_CHARS = 24_000;

export const OFFLINE_FLAG_MESSAGE = 'Score not available.';

export const ERROR_ESTIMATED_FIX_RATE = 0.85;

export const WARNING_ESTIMATED_FIX_RATE = 0.8;

export const MAX_KNIP_RETRIES = 5;

export const OXLINT_NODE_REQUIREMENT = '^20.19.0 || >=22.12.0';

export const OXLINT_RECOMMENDED_NODE_MAJOR = 24;
