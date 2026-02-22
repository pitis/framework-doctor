import { MILLISECONDS_PER_SECOND } from '../constants.js';

export const formatElapsedTime = (elapsedMs: number): string => {
  if (elapsedMs < MILLISECONDS_PER_SECOND) {
    return `${Math.round(elapsedMs)}ms`;
  }
  return `${(elapsedMs / MILLISECONDS_PER_SECOND).toFixed(1)}s`;
};
