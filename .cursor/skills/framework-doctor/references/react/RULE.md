# React Guidance

Framework Doctor for React projects: security, typecheck, Knip, oxlint.

## Quick Start

```bash
npx -y @framework-doctor/react . --verbose --diff
```

Or use the unified CLI (auto-detects React):

```bash
npx -y @framework-doctor . --verbose --diff
```

## What Gets Checked

- **Security** — dangerouslySetInnerHTML, eval, new Function(), and related patterns
- **Typecheck** — TypeScript
- **Dead code** — Knip (unused exports, files, dependencies)
- **Lint** — oxlint (JS/TS)

## Security

Avoid `dangerouslySetInnerHTML` with unsanitized user content. Sanitize with DOMPurify or sanitize-html first. Same principles as Svelte: no eval, new Function(), string-based setTimeout.
