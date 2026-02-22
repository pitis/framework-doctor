import type { SecurityRule } from './rule.js';

export const NO_AT_HTML_RULE: SecurityRule = {
  id: 'no-at-html',
  pattern: /\{@html\s+/g,
  message: 'Raw HTML via {@html} can lead to XSS if content is unsanitized.',
  help: 'Sanitize user-controlled content (e.g. with DOMPurify) or avoid {@html} for untrusted input.',
  severity: 'error',
  fileExtensions: ['.svelte'],
};
