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

export const SOURCE_FILE_PATTERN = /\.(vue|ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

export const OFFLINE_FLAG_MESSAGE = 'Score not available.';

export const VUE_MOTION_LIBRARIES = new Set([
  '@vueuse/motion',
  'vue3-motion',
  'motion-vue',
  'motion',
  'framer-motion',
]);
