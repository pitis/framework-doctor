---
name: svelte-doctor
description: Run after making Svelte changes to catch issues early. Use when reviewing code, finishing a feature, or fixing bugs in a Svelte project.
version: 1.0.0
---

# Svelte Doctor

Scans your Svelte codebase for security, performance, correctness, and architecture issues. Outputs a 0-100 score with actionable diagnostics.

## Usage

```bash
npx -y svelte-doctor@latest . --verbose --diff
```

## Workflow

Run after making changes to catch issues early. Fix errors first, then re-run to verify the score improved.
