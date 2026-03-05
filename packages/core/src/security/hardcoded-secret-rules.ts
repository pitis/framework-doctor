import type { SecurityRule } from './rule.js';

const JS_TS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];

const createSecretRule = (id: string, pattern: RegExp, description: string): SecurityRule => ({
  id,
  pattern,
  message: `${description} found in source code`,
  help: 'Remove hardcoded secrets. Use environment variables instead.',
  severity: 'error',
  fileExtensions: JS_TS_EXTENSIONS,
  skipCommentOnlyLines: true,
});

export const HARDCODED_SECRET_RULES: SecurityRule[] = [
  createSecretRule(
    'hardcoded-secret-stripe-live',
    /sk_live_[a-zA-Z0-9]{20,}/,
    'Stripe live secret key',
  ),
  createSecretRule(
    'hardcoded-secret-stripe-test',
    /sk_test_[a-zA-Z0-9]{20,}/,
    'Stripe test secret key',
  ),
  createSecretRule(
    'hardcoded-secret-github',
    /ghp_[a-zA-Z0-9]{36,}/,
    'GitHub personal access token',
  ),
  createSecretRule('hardcoded-secret-aws', /AKIA[A-Z0-9]{16}/, 'AWS access key'),
  createSecretRule('hardcoded-secret-slack', /xox[bpoas]-[a-zA-Z0-9-]{10,}/, 'Slack token'),
  createSecretRule('hardcoded-secret-jwt', /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\./, 'JWT token'),
  createSecretRule(
    'hardcoded-secret-private-key',
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
    'Private key',
  ),
  createSecretRule(
    'hardcoded-secret-mongodb',
    /mongodb\+srv:\/\/[^\s'"]+/,
    'MongoDB connection string',
  ),
  createSecretRule(
    'hardcoded-secret-postgres',
    /postgres(ql)?:\/\/[^\s'"]+@/,
    'PostgreSQL connection string',
  ),
];
