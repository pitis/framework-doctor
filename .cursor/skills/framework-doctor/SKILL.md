---
name: framework-doctor
description: Run after making frontend changes to catch issues early. Auto-detects Svelte, React (and more). Use when reviewing code, finishing a feature, or fixing bugs.
version: 1.0.0
---

# Framework Doctor

Auto-detects your framework and runs the right doctor. Scans for security, performance, correctness, and architecture issues. Outputs a 0-100 score with actionable diagnostics.

## Usage

```bash
npx -y @framework-doctor . --verbose --diff
```

Supported: Svelte, React (Vue, Angular coming soon). Detects from `package.json` dependencies.

## Direct doctor

```bash
npx -y @framework-doctor/svelte .
npx -y @framework-doctor/react .
```

## Workflow

Run after making changes to catch issues early. Fix errors first, then re-run to verify the score improved.
