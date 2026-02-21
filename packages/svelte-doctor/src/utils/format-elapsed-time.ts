import { MILLISECONDS_PER_SECOND } from "../constants.js";

/**
 * Format elapsed milliseconds as human-readable string (e.g. "793ms", "1.2s").
 */
export const formatElapsedTime = (elapsedMs: number): string => {
  if (elapsedMs < MILLISECONDS_PER_SECOND) {
    return `${elapsedMs}ms`;
  }
  const seconds = elapsedMs / MILLISECONDS_PER_SECOND;
  return `${seconds.toFixed(1)}s`;
};
