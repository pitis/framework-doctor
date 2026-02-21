# Svelte Guidance

Framework Doctor for Svelte projects: security, svelte-check, Knip, oxlint.

## Quick Start

```bash
npx -y @framework-doctor/svelte . --verbose --diff
```

Or use the unified CLI (auto-detects Svelte):

```bash
npx -y @framework-doctor . --verbose --diff
```

## What Gets Checked

- **Security** — {@html}, eval, new Function(), javascript: URLs. See [../security/svelte.md](../security/svelte.md)
- **Svelte** — svelte-check (types, a11y, warnings)
- **Dead code** — Knip (unused exports, files, dependencies)
- **Lint** — oxlint (JS/TS)

## Svelte 5 Migration

See [migration.md](./migration.md) for $props(), $effect(), {@render children()}, and other Svelte 5 patterns.
