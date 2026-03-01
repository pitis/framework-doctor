# Svelte Doctor

[![version](https://img.shields.io/npm/v/@framework-doctor/svelte.svg?style=flat)](https://npmjs.com/package/@framework-doctor/svelte)
[![downloads](https://img.shields.io/npm/dm/@framework-doctor/svelte.svg?style=flat)](https://npmjs.com/package/@framework-doctor/svelte)

Diagnose and improve your Svelte codebase health.

One command scans your codebase for security, performance, correctness, dead code, and Svelte 5 migration issues, then outputs a **0–100 score** with actionable diagnostics.

## Install

Run at your project root:

```bash
npx -y @framework-doctor/svelte .
```

Or use the unified CLI (auto-detects Svelte):

```bash
npx -y @framework-doctor/cli .
```

## Options

```
Usage: svelte-doctor [directory] [options]

Options:
  -v, --version       display the version number
  --no-lint           skip lint diagnostics
  --no-js-ts-lint     skip JavaScript/TypeScript lint diagnostics
  --no-dead-code      skip dead code detection
  --no-audit          skip dependency vulnerability audit
  --fix               auto-fix JS/TS lint issues where possible
  --format <format>   output format: text or json
  --verbose           show file details per rule
  --score             output only the score (CI-friendly)
  -y, --yes           skip prompts
  --no-analytics      disable anonymous analytics
  --project <name>    select workspace project (comma-separated)
  --diff [base]       scan only changed files vs base branch
  --offline           skip remote scoring (local score only)
  -h, --help          display help for command
```

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
  "audit": true,
  "verbose": false,
  "diff": false,
  "analytics": true
}
```

Svelte Doctor also supports unified config via `framework-doctor.config.json` with a `svelteDoctor` section. Framework-specific config overrides unified options.

Or use the `svelteDoctor` key in `package.json`:

```json
{
  "svelteDoctor": {
    "deadCode": true,
    "ignore": { "rules": ["svelte-doctor/no-at-html"] }
  }
}
```

## Security checks

Svelte Doctor flags:

- **`{@html}`** — Raw HTML can lead to XSS if content is unsanitized
- **`new Function()`** — Code injection risk
- **`setTimeout("string")` / `setInterval("string")`** — Implied eval

Plus oxlint's `no-eval` and svelte-check's `a11y_invalid_attribute` (e.g. `javascript:` URLs in `href`).

To ignore a rule: `"svelte-doctor/no-at-html"`, `"svelte-doctor/no-new-function"`, `"svelte-doctor/no-implied-eval"`.

Svelte Doctor also runs a dependency audit (`pnpm audit`) and reports high/critical vulnerabilities. Use `--no-audit` to skip.

## Analytics

Svelte Doctor optionally sends anonymous usage data when you opt in. Data is sent to your Supabase Edge Function (see [supabase/README.md](../../supabase/README.md)) when `FRAMEWORK_DOCTOR_TELEMETRY_URL` is configured. If your function enforces `TELEMETRY_KEY`, set `FRAMEWORK_DOCTOR_TELEMETRY_KEY` in the client environment. Limited to framework type, score range, diagnostic count. No code or paths are collected.

- **Opt-in**: On first run (when analytics is configured), you’ll be prompted. Your choice is stored in `~/.framework-doctor/config.json`.
- **Disable**: Use `--no-analytics`, set `"analytics": false` in config, or `DO_NOT_TRACK=1`.
- **Skipped automatically**: CI and other non-interactive environments (e.g. Cursor Agent, Claude Code).

## Contributing

```bash
git clone https://github.com/pitis/framework-doctor
cd framework-doctor
pnpm install
pnpm build
```

Run locally:

```bash
pnpm exec svelte-doctor /path/to/your/svelte-project
# or directly:
node packages/svelte-doctor/dist/cli.js /path/to/your/svelte-project
```
