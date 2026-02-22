# Framework Doctor

[![npm version](https://img.shields.io/npm/v/@framework-doctor/cli.svg)](https://www.npmjs.com/package/@framework-doctor/cli)
[![npm downloads](https://img.shields.io/npm/dm/@framework-doctor/cli.svg)](https://www.npmjs.com/package/@framework-doctor/cli)

Framework Doctor auto-detects your framework and runs the right health check. Supports **Svelte** and **React**; Vue and Angular coming soon.

## Quick start

Run in a project root (auto-detects Svelte, React, Vue, Angular from `package.json`):

```bash
npx -y @framework-doctor/cli .
```

Or run a specific doctor directly:

```bash
npx -y @framework-doctor/react .    # React
npx -y @framework-doctor/svelte .   # Svelte
```

## Try it

Clone the repo and run the doctor on our demo project (includes intentional issues to showcase diagnostics):

```bash
git clone https://github.com/pitis/framework-doctor.git
cd framework-doctor
pnpm install
pnpm run demo
```

See [examples/README.md](examples/README.md) for more demo projects and commands.

## CLI commands

**Unified (auto-detect):**

- `npx -y @framework-doctor/cli .` - auto-detect framework and run the right doctor
- `npx -y @framework-doctor/cli ./path/to/project` - scan a specific project directory

**React (direct):**

- `npx -y @framework-doctor/react .` - run a full scan
- `npx -y @framework-doctor/react ./path/to/project` - scan a specific project directory
- `npx -y @framework-doctor/react . --verbose` - include file and line details
- `npx -y @framework-doctor/react . --score` - print only the numeric score (CI-friendly)

**Svelte (direct):**

- `npx -y @framework-doctor/svelte .` - run a full scan
- `npx -y @framework-doctor/svelte ./path/to/project` - scan a specific project directory
- `npx -y @framework-doctor/svelte . --verbose` - include file and line details.
- `npx -y @framework-doctor/svelte . --score` - print only the numeric score (CI-friendly).
- `npx -y @framework-doctor/svelte . --no-js-ts-lint` - only run Svelte checks (skip JS/TS linting).
- `npx -y @framework-doctor/svelte . --diff main` - scan only files changed against `main`.
- `npx -y @framework-doctor/svelte . --project web` - select a specific workspace package.

## Options

Svelte doctor:

```txt
Usage: svelte-doctor [directory] [options]

Options:
  -v, --version       display the version number
  --no-lint           skip lint diagnostics
  --no-js-ts-lint     skip JavaScript/TypeScript lint diagnostics
  --no-dead-code      skip dead code detection
  --verbose           show file details per rule
  --score             output only the score
  -y, --yes           skip prompts
  --project <name>    select workspace project (comma-separated)
  --diff [base]       scan only changed files vs base branch
  --offline           skip remote scoring (local score only)
  -h, --help          display help for command
```

React doctor options: `--no-lint`, `--no-dead-code`, `--verbose`, `--score`, `--project`, `--diff`. See [packages/react-doctor/README.md](packages/react-doctor/README.md).

## Security checks

Svelte Doctor includes a security scan that flags:

- **`{@html}`** — Raw HTML can lead to XSS if content is unsanitized
- **`new Function()`** — Code injection risk
- **`setTimeout("string")` / `setInterval("string")`** — Implied eval

Plus oxlint's `no-eval` and svelte-check's `a11y_invalid_attribute` (e.g. `javascript:` URLs in `href`).

To ignore a rule: `"svelte-doctor/no-at-html"`, `"svelte-doctor/no-new-function"`, `"svelte-doctor/no-implied-eval"`.

## Configuration

Create `svelte-doctor.config.json`:

```json
{
  "ignore": {
    "rules": ["svelte-check/a11y-missing-attribute", "svelte-doctor/no-at-html"],
    "files": ["src/generated/**"]
  },
  "lint": true,
  "jsTsLint": true,
  "deadCode": true,
  "verbose": false,
  "diff": false
}
```

Or use `package.json`:

```json
{
  "svelteDoctor": {
    "deadCode": true
  }
}
```
