# Framework Doctor Examples

Demo projects to try Framework Doctor. Each example includes **intentional issues** so you can see what diagnostics the doctor reports.

## Svelte: demo-app

A minimal SvelteKit app with intentional issues. See [svelte/demo-app/README.md](svelte/demo-app/README.md) for details.

### Run from the repo

After cloning and installing:

```bash
# Build the monorepo first
pnpm build

# Run unified CLI (auto-detects Svelte)
pnpm exec framework-doctor examples/svelte/demo-app

# Or run Svelte doctor directly
pnpm exec svelte-doctor examples/svelte/demo-app
```

### Run with npx (no clone)

```bash
npx -y @framework-doctor/cli /path/to/framework-doctor/examples/svelte/demo-app
```

Or from repo root after `pnpm install`:

```bash
npx -y @framework-doctor/cli examples/svelte/demo-app
```

### What to expect

- **Errors** — Security findings (eval, new Function, implied eval, {@html}, javascript: URLs)
- **Warnings** — Dead/unused code, lint issues, legacy Svelte patterns
- **Score** — A 0–100 health score for the project

Add `--verbose` to see file and line details for each finding.
