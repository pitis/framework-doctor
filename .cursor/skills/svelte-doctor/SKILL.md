---
name: svelte-doctor
description: Run after making Svelte changes to catch issues early. Use when reviewing code, finishing a feature, or fixing bugs in a Svelte project.
version: 1.0.0
---

# Svelte Doctor

Scans your Svelte codebase for security, performance, correctness, and architecture issues. Outputs a 0-100 score with actionable diagnostics.

## Usage

```bash
npx -y @framework-doctor/svelte@latest . --verbose --diff
```

Or use the unified CLI (auto-detects Svelte):

```bash
npx -y @framework-doctor . --verbose --diff
```

## Workflow

Run after making changes to catch issues early. Fix errors first, then re-run to verify the score improved.

## What it checks

- **Security** — `{@html}`, `new Function()`, `eval()`, `setTimeout("string")`, `javascript:` URLs
- **Svelte** — svelte-check (types, a11y, warnings)
- **Dead code** — Knip (unused exports, files, dependencies)
- **Lint** — oxlint (JS/TS)

## Svelte-specific fixes

- Prefer `$props()` over `export let`
- Use `$effect` instead of `onMount` for reactivity
- Replace `createEventDispatcher` with callback props
- Use `{@render children()}` instead of `<slot />`
- Add keys to `{#each}` blocks
- Avoid `{@html}` with unsanitized user content
