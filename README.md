# Framework Doctor

[![npm version](https://img.shields.io/npm/v/@framework-doctor/cli.svg)](https://www.npmjs.com/package/@framework-doctor/cli)
[![npm downloads](https://img.shields.io/npm/dm/@framework-doctor/cli.svg)](https://www.npmjs.com/package/@framework-doctor/cli)

Framework Doctor auto-detects your framework and runs the right health check. Supports **Svelte**, **React**, **Vue**, and **Angular**.

## Quick start

Run in a project root (auto-detects Svelte, React, Vue, Angular from `package.json`):

```bash
npx -y @framework-doctor/cli .
```

Or run a specific doctor directly:

```bash
npx -y @framework-doctor/react .    # React
npx -y @framework-doctor/svelte .   # Svelte
npx -y @framework-doctor/vue .      # Vue
npx -y @framework-doctor/angular .   # Angular
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
- `npx -y @framework-doctor/cli . --watch` - re-scan on file changes

**React (direct):**

- `npx -y @framework-doctor/react .` - run a full scan
- `npx -y @framework-doctor/react ./path/to/project` - scan a specific project directory
- `npx -y @framework-doctor/react . --verbose` - include file and line details
- `npx -y @framework-doctor/react . --score` - print only the numeric score (CI-friendly)
- `npx -y @framework-doctor/react . --format json` - machine-readable output
- `npx -y @framework-doctor/react . --fix` - auto-fix lint issues

**Vue (direct):**

- `npx -y @framework-doctor/vue .` - run a full scan
- `npx -y @framework-doctor/vue . --verbose` - include file and line details
- `npx -y @framework-doctor/vue . --score` - print only the numeric score (CI-friendly)
- `npx -y @framework-doctor/vue . --format json` - machine-readable output
- `npx -y @framework-doctor/vue . --diff main` - scan only files changed against `main`.
- `npx -y @framework-doctor/vue . --project web` - select a specific workspace package.

**Svelte (direct):**

- `npx -y @framework-doctor/svelte .` - run a full scan
- `npx -y @framework-doctor/svelte ./path/to/project` - scan a specific project directory
- `npx -y @framework-doctor/svelte . --verbose` - include file and line details.
- `npx -y @framework-doctor/svelte . --score` - print only the numeric score (CI-friendly).
- `npx -y @framework-doctor/svelte . --format json` - machine-readable output.
- `npx -y @framework-doctor/svelte . --fix` - auto-fix JS/TS lint issues.
- `npx -y @framework-doctor/svelte . --no-js-ts-lint` - only run Svelte checks (skip JS/TS linting).
- `npx -y @framework-doctor/svelte . --diff main` - scan only files changed against `main`.
- `npx -y @framework-doctor/svelte . --project web` - select a specific workspace package.

**Angular (direct):**

- `npx -y @framework-doctor/angular .` - run a full scan
- `npx -y @framework-doctor/angular ./path/to/project` - scan a specific project directory
- `npx -y @framework-doctor/angular . --verbose` - include file and line details
- `npx -y @framework-doctor/angular . --score` - print only the numeric score (CI-friendly)
- `npx -y @framework-doctor/angular . --format json` - machine-readable output
- `npx -y @framework-doctor/angular . --diff main` - scan only files changed against `main`
- `npx -y @framework-doctor/angular . --project my-app` - select a specific workspace project

## Options

Svelte doctor:

```txt
Usage: svelte-doctor [directory] [options]

Options:
  -v, --version       display the version number
  --no-lint           skip lint diagnostics
  --no-js-ts-lint     skip JavaScript/TypeScript lint diagnostics
  --no-dead-code      skip dead code detection
  --no-audit          skip dependency vulnerability audit
  --fix               auto-fix lint issues where possible
  --format <format>   output format: text or json
  --verbose           show file details per rule
  --score             output only the score
  -y, --yes           skip prompts
  --no-analytics      disable anonymous analytics
  --project <name>    select workspace project (comma-separated)
  --diff [base]       scan only changed files vs base branch
  --offline           skip remote scoring (local score only)
  -h, --help          display help for command
```

React doctor options: `--no-lint`, `--no-dead-code`, `--no-audit`, `--fix`, `--format json`, `--verbose`, `--score`, `--no-analytics`, `--project`, `--diff`, `--offline`. See [packages/react-doctor/README.md](packages/react-doctor/README.md).

Vue doctor options: `--no-lint`, `--no-dead-code`, `--no-audit`, `--format json`, `--verbose`, `--score`, `--no-analytics`, `--project`, `--diff`, `--offline`. See [packages/vue-doctor/README.md](packages/vue-doctor/README.md).

Angular doctor options: `--no-lint`, `--no-dead-code`, `--no-audit`, `--format json`, `--verbose`, `--score`, `--no-analytics`, `--project`, `--diff`, `--offline`. See [packages/angular-doctor/README.md](packages/angular-doctor/README.md).

## Security checks

Svelte Doctor includes a security scan that flags:

- **`{@html}`** — Raw HTML can lead to XSS if content is unsanitized
- **`new Function()`** — Code injection risk
- **`setTimeout("string")` / `setInterval("string")`** — Implied eval

Plus oxlint's `no-eval` and svelte-check's `a11y_invalid_attribute` (e.g. `javascript:` URLs in `href`).

To ignore a rule: `"svelte-doctor/no-at-html"`, `"svelte-doctor/no-new-function"`, `"svelte-doctor/no-implied-eval"`.

## Analytics

The doctors optionally send anonymous usage data when you opt in. Data is stored in your Supabase (see [supabase/README.md](supabase/README.md)). If your function enforces `TELEMETRY_KEY`, set `FRAMEWORK_DOCTOR_TELEMETRY_KEY` in the client environment. To disable: `--no-analytics`, `"analytics": false` in config, or `DO_NOT_TRACK=1`.

## Configuration

### Unified config (`framework-doctor.config.json`)

Shared config for monorepos with multiple frameworks. Supports top-level shared options and framework sections:

```json
{
  "ignore": {
    "files": ["src/generated/**"]
  },
  "verbose": false,
  "analytics": true,
  "svelteDoctor": { "jsTsLint": false },
  "reactDoctor": { "lint": true },
  "vueDoctor": {},
  "angularDoctor": {}
}
```

### Framework-specific config

Create `svelte-doctor.config.json` (or `vue-doctor.config.json`, etc.):

```json
{
  "ignore": {
    "rules": ["svelte-check/a11y-missing-attribute", "svelte-doctor/no-at-html"],
    "files": ["src/generated/**"]
  },
  "lint": true,
  "jsTsLint": true,
  "deadCode": true,
  "audit": true,
  "verbose": false,
  "diff": false,
  "analytics": true
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

Framework-specific config overrides the unified config.

## Machine-readable output

Use `--format json` for CI or tooling integration:

```bash
npx -y @framework-doctor/cli . --format json -y
```

Output includes: `doctor`, `version`, `diagnostics`, `scoreResult`, `totalFilesScanned`, `elapsedMilliseconds`, `skippedChecks`.

## Watch mode

Re-scan on file changes during development:

```bash
npx -y @framework-doctor/cli . --watch
```

## Dependency audit

By default, the doctor runs `pnpm audit` and reports high or critical vulnerabilities. Use `--no-audit` to skip.
