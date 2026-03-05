import fs from 'node:fs';
import path from 'node:path';
import type { Diagnostic } from '../types.js';
import {
  API_ROUTE_AUTH_SIGNAL_PATTERN,
  API_ROUTE_MUTATING_HANDLER_PATTERN,
  ENV_FILES,
  ENV_LEAK_PATTERN,
  SECURITY_HEADER_PATTERNS,
} from './constants.js';
import type { FrameworkSecurityProfile } from './framework-profiles.js';
import { SOURCE_FILE_PATTERN_FULL, getFilesToScan } from './get-files-to-scan.js';

const createDiagnostic = (
  rootDir: string,
  plugin: string,
  rule: string,
  severity: 'error' | 'warning',
  message: string,
  help: string,
  relativePath: string,
  line = 1,
  column = 0,
): Diagnostic => ({
  filePath: path.join(rootDir, relativePath),
  plugin,
  rule,
  severity,
  message,
  help,
  line,
  column,
  category: 'security',
});

const readFileContent = (filePath: string): string | null => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
};

const checkEnvLeaks = (
  rootDir: string,
  profile: FrameworkSecurityProfile,
  diagnostics: Diagnostic[],
): void => {
  if (profile.envLeakPrefixes.length === 0) return;

  const envLeakRegexes = profile.envLeakPrefixes.map(
    (prefix) =>
      new RegExp(
        `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${ENV_LEAK_PATTERN.source}`,
        ENV_LEAK_PATTERN.flags,
      ),
  );

  for (const envFile of ENV_FILES) {
    const fullPath = path.join(rootDir, envFile);
    const content = readFileContent(fullPath);
    if (!content) continue;

    const lines = content.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line || line.startsWith('#')) continue;

      const keyMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
      if (keyMatch && envLeakRegexes.some((envLeakRegex) => envLeakRegex.test(keyMatch[1]))) {
        diagnostics.push(
          createDiagnostic(
            rootDir,
            profile.plugin,
            'env-leak',
            'error',
            `${keyMatch[1]} is public but contains secret-like name`,
            'Use server-only env vars for secrets. Public vars are exposed to the client.',
            envFile,
            index + 1,
            0,
          ),
        );
      }
    }
  }
};

const checkPublicConfigLeaks = (
  rootDir: string,
  profile: FrameworkSecurityProfile,
  diagnostics: Diagnostic[],
): void => {
  if (profile.publicConfigPathPatterns.length === 0) return;

  const sourceFiles = getFilesToScan(rootDir, [], SOURCE_FILE_PATTERN_FULL);
  for (const sourceFile of sourceFiles) {
    const relativePath = normalizeRelativePath(rootDir, sourceFile);
    const isPublicConfig = profile.publicConfigPathPatterns.some((pattern) =>
      pattern.test(relativePath),
    );
    if (!isPublicConfig) continue;

    const content = readFileContent(sourceFile);
    if (!content) continue;

    const lines = content.split('\n');
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const keyRegex = /(?:^|[,{])\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?\s*:/g;
      let keyMatch: RegExpExecArray | null;
      while ((keyMatch = keyRegex.exec(line)) !== null) {
        if (!ENV_LEAK_PATTERN.test(keyMatch[1])) continue;

        diagnostics.push(
          createDiagnostic(
            rootDir,
            profile.plugin,
            'public-config-leak',
            'error',
            `${keyMatch[1]} is defined in public client configuration`,
            'Move secrets to server-side configuration and keep only non-sensitive client values in public config files.',
            relativePath,
            lineIndex + 1,
            0,
          ),
        );
      }
    }
  }
};

const checkGitignore = (rootDir: string, plugin: string, diagnostics: Diagnostic[]): void => {
  const gitignorePath = path.join(rootDir, '.gitignore');
  const content = readFileContent(gitignorePath);

  if (!content) {
    diagnostics.push(
      createDiagnostic(
        rootDir,
        plugin,
        'no-gitignore',
        'warning',
        'No .gitignore file found',
        'Add a .gitignore file and exclude .env to prevent committing secrets.',
        '.gitignore',
      ),
    );
    return;
  }

  if (!content.includes('.env')) {
    diagnostics.push(
      createDiagnostic(
        rootDir,
        plugin,
        'gitignore-missing-env',
        'error',
        '.env files not in .gitignore',
        'Add .env and .env.* to .gitignore to prevent committing secrets.',
        '.gitignore',
      ),
    );
  }
};

const checkSecurityHeaders = (
  rootDir: string,
  profile: FrameworkSecurityProfile,
  diagnostics: Diagnostic[],
): void => {
  let didReadConfig = false;
  for (const configFile of profile.configPathsForHeaders) {
    const fullPath = path.join(rootDir, configFile);
    const content = readFileContent(fullPath);
    if (!content) continue;

    didReadConfig = true;
    const hasHeader = SECURITY_HEADER_PATTERNS.some((pattern) => pattern.test(content));
    if (hasHeader) return;
  }

  if (!didReadConfig) return;

  const firstConfig = profile.configPathsForHeaders[0] ?? 'config';
  diagnostics.push(
    createDiagnostic(
      rootDir,
      profile.plugin,
      'no-security-headers',
      'warning',
      'No security headers configured in framework config',
      `Configure Content-Security-Policy, X-Frame-Options, X-Content-Type-Options in ${firstConfig}.`,
      firstConfig,
    ),
  );
};

const hasMiddleware = (rootDir: string, profile: FrameworkSecurityProfile): boolean => {
  for (const middlewarePath of profile.middlewarePaths) {
    const fullPath = path.join(rootDir, middlewarePath);
    if (!fs.existsSync(fullPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isFile() && /\.(ts|js|mjs|cjs)$/.test(middlewarePath)) {
      return true;
    }
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      if (entries.some((entry) => entry.isFile() && /\.(ts|js|mjs|cjs)$/.test(entry.name))) {
        return true;
      }
    }
  }
  return false;
};

const checkMiddleware = (
  rootDir: string,
  profile: FrameworkSecurityProfile,
  diagnostics: Diagnostic[],
): void => {
  if (profile.middlewarePaths.length === 0) return;
  if (hasMiddleware(rootDir, profile)) return;

  const paths = profile.middlewarePaths.join(', ');
  const firstPath = profile.middlewarePaths[0] ?? '';
  diagnostics.push(
    createDiagnostic(
      rootDir,
      profile.plugin,
      'no-middleware',
      'warning',
      `No middleware found (checked: ${paths})`,
      'Add middleware for route protection and auth checks.',
      firstPath,
    ),
  );
};

const normalizeRelativePath = (rootDir: string, absolutePath: string): string =>
  path.relative(rootDir, absolutePath).split(path.sep).join('/');

const findLineNumberForPattern = (content: string, pattern: RegExp): number => {
  const lines = content.split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    if (pattern.test(lines[lineIndex])) {
      return lineIndex + 1;
    }
  }
  return 1;
};

const checkUnprotectedApiRoutes = (
  rootDir: string,
  profile: FrameworkSecurityProfile,
  diagnostics: Diagnostic[],
): void => {
  if (profile.apiRoutePathPatterns.length === 0) return;

  const sourceFiles = getFilesToScan(rootDir, [], SOURCE_FILE_PATTERN_FULL);
  for (const sourceFile of sourceFiles) {
    const relativePath = normalizeRelativePath(rootDir, sourceFile);
    const isApiRoute = profile.apiRoutePathPatterns.some((pattern) => pattern.test(relativePath));
    if (!isApiRoute) {
      continue;
    }

    const content = readFileContent(sourceFile);
    if (!content) {
      continue;
    }

    if (!API_ROUTE_MUTATING_HANDLER_PATTERN.test(content)) {
      continue;
    }

    if (API_ROUTE_AUTH_SIGNAL_PATTERN.test(content)) {
      continue;
    }

    diagnostics.push(
      createDiagnostic(
        rootDir,
        profile.plugin,
        'unprotected-api-route',
        'error',
        `API route ${relativePath} appears to handle mutating requests without auth guard`,
        'Add authentication/authorization checks for mutating API handlers (POST, PUT, PATCH, DELETE).',
        relativePath,
        findLineNumberForPattern(content, API_ROUTE_MUTATING_HANDLER_PATTERN),
        0,
      ),
    );
  }
};

export const runProjectSecurityScan = (
  rootDirectory: string,
  profile: FrameworkSecurityProfile,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  checkEnvLeaks(rootDirectory, profile, diagnostics);
  checkPublicConfigLeaks(rootDirectory, profile, diagnostics);
  checkGitignore(rootDirectory, profile.plugin, diagnostics);
  checkSecurityHeaders(rootDirectory, profile, diagnostics);
  checkMiddleware(rootDirectory, profile, diagnostics);
  checkUnprotectedApiRoutes(rootDirectory, profile, diagnostics);

  return diagnostics;
};
