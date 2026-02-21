---
name: svelte-security
description: Svelte-specific security guidance. Use when handling user input, rendering HTML, or using dynamic code execution.
version: 1.0.0
---

# Svelte Security

Svelte security patterns and anti-patterns.

## Avoid

- **`{@html}`** with unsanitized user content — XSS. Sanitize first or use text.
- **`new Function()`** — code injection. Use structured data instead.
- **`eval()`** — arbitrary code execution.
- **`setTimeout("string")` / `setInterval("string")`** — implied eval.
- **`javascript:` URLs** in `href` — XSS. Use `#` or proper handlers.
- **`<a href={userInput}>`** — validate/sanitize URLs.

## Safe patterns

- Render user content as text: `{userInput}`
- Use `sanitize-html` or DOMPurify before `{@html}` if HTML is required
- Use callback functions for `setTimeout(fn, ms)` not string eval
- Use `node:url` or a URL parser to validate links
