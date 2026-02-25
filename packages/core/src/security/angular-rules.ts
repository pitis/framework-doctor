import type { SecurityRule } from './rule.js';

const ANGULAR_TEMPLATE_EXTENSIONS = ['.html', '.ts'];

export const NO_INNER_HTML_BINDING_RULE: SecurityRule = {
  id: 'no-inner-html-binding',
  pattern: /\[innerHTML\]\s*=/g,
  message: 'Binding to [innerHTML] can lead to XSS if content is unsanitized.',
  help: 'Sanitize user-controlled content (e.g. with DomSanitizer.sanitize()) or avoid [innerHTML] for untrusted input.',
  severity: 'error',
  fileExtensions: ANGULAR_TEMPLATE_EXTENSIONS,
};

const ANGULAR_TS_EXTENSIONS = ['.ts', '.mts', '.cts'];

export const NO_BYPASS_SECURITY_TRUST_RULE: SecurityRule = {
  id: 'no-bypass-security-trust',
  pattern: /\.bypassSecurityTrust\w+\s*\(/g,
  message: 'bypassSecurityTrust* disables Angular sanitization and can lead to XSS.',
  help: 'Avoid bypassing security for user-controlled content. Use DomSanitizer.sanitize() or trusted sources only.',
  severity: 'error',
  fileExtensions: ANGULAR_TS_EXTENSIONS,
};
