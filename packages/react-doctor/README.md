# React Doctor

[![version](https://img.shields.io/npm/v/@framework-doctor/react.svg?style=flat)](https://npmjs.com/package/@framework-doctor/react)
[![downloads](https://img.shields.io/npm/dm/@framework-doctor/react.svg?style=flat)](https://npmjs.com/package/@framework-doctor/react)

Diagnose and improve your React codebase health.

One command scans your codebase for security, performance, correctness, and architecture issues, then outputs a **0–100 score** with actionable diagnostics.

## How it works

React Doctor detects your framework (Next.js, Vite, Remix, etc.), React version, and compiler setup, then runs two analysis passes **in parallel**:

1. **Lint**: Checks 60+ rules across state & effects, performance, architecture, bundle size, security, correctness, accessibility, and framework-specific categories (Next.js, React Native). Rules are toggled automatically based on your project setup.
2. **Dead code**: Detects unused files, exports, types, and duplicates.
3. **Dependency audit**: Runs `pnpm audit` and reports high/critical vulnerabilities (use `--no-audit` to skip).

Diagnostics are filtered through your config, then scored by severity (errors weigh more than warnings) to produce a **0–100 health score** (75+ Great, 50–74 Needs work, <50 Critical).

## Install

```bash
pnpm add -D @framework-doctor/react
pnpm react-doctor .
```

Or run without installing:

```bash
npx @framework-doctor/react .
```

Use `--verbose` to see affected files and line numbers:

```bash
pnpm react-doctor . --verbose
```

## Cursor skill

Add the React Doctor skill so your AI assistant knows all 47+ React best practice rules. Copy `.cursor/skills/framework-doctor` from this repo into your project or global Cursor skills (e.g. `~/.cursor/skills/`).

## Options

```
Usage: react-doctor [directory] [options]

Options:
  -v, --version     display the version number
  --no-lint         skip linting
  --no-dead-code    skip dead code detection
  --no-audit        skip dependency vulnerability audit
  --fix             auto-fix lint issues where possible
  --format <fmt>    output format: text or json
  --verbose         show file details per rule
  --score           output only the score
  -y, --yes         skip prompts, scan all workspace projects
  --project <name>  select workspace project (comma-separated for multiple)
  --diff [base]     scan only files changed vs base branch
  --no-analytics    disable anonymous analytics
  -h, --help        display help for command
```

## Configuration

Create a `react-doctor.config.json` in your project root to customize behavior:

```json
{
  "ignore": {
    "rules": ["react/no-danger", "jsx-a11y/no-autofocus", "knip/exports"],
    "files": ["src/generated/**"]
  }
}
```

You can also use the `"reactDoctor"` key in your `package.json` instead:

```json
{
  "reactDoctor": {
    "ignore": {
      "rules": ["react/no-danger"]
    }
  }
}
```

If both exist, `react-doctor.config.json` takes precedence. React Doctor also supports unified config via `framework-doctor.config.json` with a `reactDoctor` section. Framework-specific config overrides unified options.

### Config options

| Key            | Type                | Default | Description                                                                                                                         |
| -------------- | ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ignore.rules` | `string[]`          | `[]`    | Rules to suppress, using the `plugin/rule` format shown in diagnostic output (e.g. `react/no-danger`, `knip/exports`, `knip/types`) |
| `ignore.files` | `string[]`          | `[]`    | File paths to exclude, supports glob patterns (`src/generated/**`, `**/*.test.tsx`)                                                 |
| `lint`         | `boolean`           | `true`  | Enable/disable lint checks (same as `--no-lint`)                                                                                    |
| `deadCode`     | `boolean`           | `true`  | Enable/disable dead code detection (same as `--no-dead-code`)                                                                       |
| `audit`        | `boolean`           | `true`  | Enable/disable dependency vulnerability audit (same as `--no-audit`)                                                                |
| `verbose`      | `boolean`           | `false` | Show file details per rule (same as `--verbose`)                                                                                    |
| `diff`         | `boolean \| string` | —       | Force diff mode (`true`) or pin a base branch (`"main"`). Set to `false` to disable auto-detection.                                 |
| `analytics`    | `boolean`           | `true`  | Enable/disable anonymous analytics (same as `--no-analytics`)                                                                       |

CLI flags always override config values.

## Analytics

React Doctor optionally sends anonymous usage data to help improve the tool. Data is sent to your Supabase Edge Function when you opt in and is limited to: framework type, score range, diagnostic count, and similar aggregates. No code, file paths, or project names are collected.

- **Enable** (for maintainers): Set `FRAMEWORK_DOCTOR_TELEMETRY_URL` to your Supabase Edge Function URL (e.g. `https://<project>.supabase.co/functions/v1/telemetry`) in your publish/CI env.
- **Shared key (optional)**: If your Supabase function enforces `TELEMETRY_KEY`, set `FRAMEWORK_DOCTOR_TELEMETRY_KEY` in the client environment.
- **Opt-in**: On first run (when analytics is configured), you’ll be prompted. Your choice is stored in `~/.framework-doctor/config.json`.
- **Disable**: Use `--no-analytics`, set `"analytics": false` in config, or set `DO_NOT_TRACK=1`.
- **Skipped automatically**: CI and other non-interactive environments (e.g. Cursor Agent, Claude Code).

## Node.js API

You can also use React Doctor programmatically:

```js
import { diagnose } from '@framework-doctor/react/api';

const result = await diagnose('./path/to/your/react-project');

console.log(result.score); // { score: 82, label: "Good" } or null
console.log(result.diagnostics); // Array of Diagnostic objects
console.log(result.project); // Detected framework, React version, etc.
```

The `diagnose` function accepts an optional second argument:

```js
const result = await diagnose('.', {
  lint: true, // run lint checks (default: true)
  deadCode: true, // run dead code detection (default: true)
});
```

Each diagnostic has the following shape:

```ts
interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  help: string;
  line: number;
  column: number;
  category: string;
}
```

## Contributing

```bash
git clone https://github.com/pitis/framework-doctor
cd framework-doctor
pnpm install
pnpm build
```

Run locally:

```bash
pnpm exec react-doctor /path/to/your/react-project
# or directly:
node packages/react-doctor/dist/cli.js /path/to/your/react-project
```

### License

React Doctor is MIT-licensed open-source software.
