export const EXCLUDED_FILE_PATTERNS: RegExp[] = [
  /\.test\.(ts|js|tsx|jsx)$/,
  /\.spec\.(ts|js|tsx|jsx)$/,
  /__tests__\//,
  /\/tests?\//,
  /\/fixtures?\//,
  /\/test-utils?\//,
  /\.stories\.(ts|js|tsx|jsx)$/,
  /\.mock\.(ts|js|tsx|jsx)$/,
];

export const ENV_LEAK_PATTERN = /.*(?:SECRET|KEY|TOKEN|PASSWORD|PRIVATE|CREDENTIAL)/i;

export const COMMENT_ONLY_LINE_PATTERN = /^\s*(?:\/\/|\*|\/\*|\*\/)/;

export const SECURITY_HEADER_PATTERNS: RegExp[] = [
  /Content-Security-Policy/,
  /X-Frame-Options/,
  /X-Content-Type-Options/,
  /Strict-Transport-Security/,
  /Referrer-Policy/,
];

export const ENV_FILES = ['.env', '.env.local', '.env.development', '.env.production'];

export const API_ROUTE_MUTATING_HANDLER_PATTERN =
  /(?:export\s+(?:async\s+)?function\s+(?:POST|PUT|PATCH|DELETE)\b|export\s+const\s+(?:POST|PUT|PATCH|DELETE)\b|\breq\.method\s*===?\s*['"`](?:POST|PUT|PATCH|DELETE)['"`]|\b(?:router|app|server)\.(?:post|put|patch|delete)\s*\(|@\s*(?:Post|Put|Patch|Delete)\s*\()/;

export const API_ROUTE_AUTH_SIGNAL_PATTERN =
  /\b(?:auth|authenticate|authorization|getServerSession|requireAuth|verify(?:Token|Jwt|Signature)|clerk|supabase\.auth|getUser|withAuth|isAuthenticated|validateSession)\b/i;
