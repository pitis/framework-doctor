import type { SecurityRule } from './rule.js';

export const NO_V_HTML_RULE: SecurityRule = {
  id: 'no-v-html',
  pattern: /v-html\s*=/g,
  message: 'Raw HTML via v-html can lead to XSS if content is unsanitized.',
  help: 'Sanitize user-controlled content (e.g. with DOMPurify) or avoid v-html for untrusted input.',
  severity: 'error',
  fileExtensions: ['.vue'],
};
