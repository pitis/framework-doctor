# Angular Doctor

[![version](https://img.shields.io/npm/v/@framework-doctor/angular.svg?style=flat)](https://npmjs.com/package/@framework-doctor/angular)
[![downloads](https://img.shields.io/npm/dm/@framework-doctor/angular.svg?style=flat)](https://npmjs.com/package/@framework-doctor/angular)

Diagnose and improve your Angular codebase health.

One command scans your codebase for security, performance, correctness, and dead code issues, then outputs a **0–100 score** with actionable diagnostics.

## Install

Run at your project root:

```bash
npx -y @framework-doctor/angular .
```

Or use the unified CLI (auto-detects Angular):

```bash
npx -y @framework-doctor/cli .
```

## Options

```
Usage: angular-doctor [directory] [options]

Options:
  -v, --version       display the version number
  --no-lint           skip linting
  --no-dead-code      skip dead code detection
  --no-audit          skip dependency vulnerability audit
  --format <format>   output format: text or json
  --verbose           show file details per rule
  --score             output only the score (CI-friendly)
  -y, --yes           skip prompts, scan all workspace projects
  --no-analytics      disable anonymous analytics
  --project <name>    select workspace project (comma-separated for multiple)
  --diff [base]       scan only files changed vs base branch
  --offline           skip remote scoring (local score only)
  -h, --help          display help for command
```

## Configuration

Create `angular-doctor.config.json`:

```json
{
  "ignore": {
    "rules": ["angular-doctor/no-eval", "angular-doctor/no-inner-html-binding"],
    "files": ["src/generated/**"]
  },
  "lint": true,
  "deadCode": true,
  "audit": true,
  "verbose": false,
  "diff": false,
  "analytics": true
}
```

Or use the `angularDoctor` key in `package.json`:

```json
{
  "angularDoctor": {
    "deadCode": true,
    "ignore": { "rules": ["angular-doctor/no-eval"] }
  }
}
```

Angular Doctor also supports unified config via `framework-doctor.config.json` with an `angularDoctor` section. Framework-specific config overrides unified options.

## Security checks

Angular Doctor flags:

- **`eval()`** — Code injection risk
- **`new Function()`** — Code injection risk
- **`setTimeout("string")` / `setInterval("string")`** — Implied eval
- **`innerHTML` binding** — Raw HTML can lead to XSS if content is unsanitized
- **`bypassSecurityTrust*`** — Bypassing Angular’s sanitizer can lead to XSS

Angular Doctor also runs a dependency audit (`pnpm audit`) and reports high/critical vulnerabilities. Use `--no-audit` to skip.

## Analytics

Angular Doctor optionally sends anonymous usage data when you opt in. Data is sent to your Supabase Edge Function (see [supabase/README.md](../../supabase/README.md)) when `FRAMEWORK_DOCTOR_TELEMETRY_URL` is configured. If your function enforces `TELEMETRY_KEY`, set `FRAMEWORK_DOCTOR_TELEMETRY_KEY` in the client environment. Limited to framework type, score range, diagnostic count. No code or paths are collected.

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
pnpm exec angular-doctor /path/to/your/angular-project
# or directly:
node packages/angular-doctor/dist/cli.js /path/to/your/angular-project
```
