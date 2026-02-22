import type { SecurityRule } from './rule.js';

const JS_TS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];

export const NO_EVAL_RULE: SecurityRule = {
  id: 'no-eval',
  pattern: /\beval\s*\(/g,
  message: 'eval() can execute arbitrary code (code injection risk).',
  help: 'Avoid dynamic code evaluation. Use static logic or safe alternatives.',
  severity: 'error',
  fileExtensions: JS_TS_EXTENSIONS,
};

export const NO_NEW_FUNCTION_RULE: SecurityRule = {
  id: 'no-new-function',
  pattern: /\bnew\s+Function\s*\(/g,
  message: 'new Function() can execute arbitrary code (code injection risk).',
  help: 'Avoid dynamic code evaluation. Use static functions or safe alternatives.',
  severity: 'error',
  fileExtensions: JS_TS_EXTENSIONS,
};

export const NO_IMPLIED_EVAL_SET_TIMEOUT_RULE: SecurityRule = {
  id: 'no-implied-eval',
  pattern: /\bsetTimeout\s*\(\s*["']/g,
  message: 'setTimeout with string argument executes code (implied eval).',
  help: 'Use a function callback instead: setTimeout(() => { ... }, delay).',
  severity: 'error',
  fileExtensions: JS_TS_EXTENSIONS,
};

export const NO_IMPLIED_EVAL_SET_INTERVAL_RULE: SecurityRule = {
  id: 'no-implied-eval',
  pattern: /\bsetInterval\s*\(\s*["']/g,
  message: 'setInterval with string argument executes code (implied eval).',
  help: 'Use a function callback instead: setInterval(() => { ... }, delay).',
  severity: 'error',
  fileExtensions: JS_TS_EXTENSIONS,
};

export const UNIVERSAL_SECURITY_RULES: SecurityRule[] = [
  NO_EVAL_RULE,
  NO_NEW_FUNCTION_RULE,
  NO_IMPLIED_EVAL_SET_TIMEOUT_RULE,
  NO_IMPLIED_EVAL_SET_INTERVAL_RULE,
];
