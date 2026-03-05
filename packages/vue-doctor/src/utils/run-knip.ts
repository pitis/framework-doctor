import { runKnipJson } from '@framework-doctor/core';
import type { Diagnostic } from '../types.js';

export const runKnip = async (rootDirectory: string): Promise<Diagnostic[]> =>
  runKnipJson(rootDirectory);
