# Security Patterns Overview

Framework Doctor flags common security anti-patterns in Svelte and React projects.

## Key Principles

1. **Never trust user input** — Sanitize or escape before rendering
2. **Avoid dynamic code execution** — No eval(), new Function(), string-based setTimeout/setInterval
3. **Validate URLs** — User-provided href values can be javascript: or malicious

## Reference Index

| File                         | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| [svelte.md](./svelte.md)     | Svelte-specific ({@html}, javascript: URLs)      |
| [patterns.md](./patterns.md) | WRONG/CORRECT patterns, eval, URLs, sanitization |

## Safe Patterns Summary

- Render user content as text: `{userInput}` (Svelte) or `{userInput}` (React)
- Use sanitize-html or DOMPurify before `{@html}` if HTML is required
- Use callback functions for setTimeout(fn, ms) — never string eval
- Use node:url or a URL parser to validate links
- Avoid `{@html}` with unsanitized user content
