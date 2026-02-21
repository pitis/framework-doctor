# CLI Usage

Framework Doctor provides a unified CLI that auto-detects your framework from `package.json` dependencies, plus framework-specific CLIs.

## Unified CLI (Recommended)

Auto-detects Svelte, React from `package.json`:

```bash
npx -y @framework-doctor/cli . --verbose --diff
```

Detects: `svelte`, `@sveltejs/kit`, `react`, `next`, `remix`, `vue`, `nuxt`, `@angular/core`.

## Framework-Specific CLI

When you know the framework or want to bypass detection:

```bash
npx -y @framework-doctor/svelte .
npx -y @framework-doctor/react .
```

## When to Use Which

| Scenario                           | Command                             |
| ---------------------------------- | ----------------------------------- |
| General project, unknown framework | `npx -y @framework-doctor/cli .`    |
| Svelte project                     | `npx -y @framework-doctor/svelte .` |
| React project                      | `npx -y @framework-doctor/react .`  |
| Monorepo with multiple frameworks  | Run framework-specific per package  |

## Flags

See [commands.md](./commands.md) for --verbose, --diff, --score, and other options.
