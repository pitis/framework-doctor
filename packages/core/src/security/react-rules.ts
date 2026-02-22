import type { SecurityRule } from './rule.js';

const JSX_EXTENSIONS = ['.tsx', '.jsx'];

export const DANGEROUSLY_SET_INNER_HTML_RULE: SecurityRule = {
  id: 'no-dangerously-set-inner-html',
  pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/g,
  message: 'dangerouslySetInnerHTML with raw content can lead to XSS if unsanitized.',
  help: 'Sanitize user-controlled content (e.g. with DOMPurify) before rendering.',
  severity: 'error',
  fileExtensions: JSX_EXTENSIONS,
};
