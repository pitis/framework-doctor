# React Doctor

[![version](https://img.shields.io/npm/v/@framework-doctor/react.svg?style=flat)](https://npmjs.com/package/@framework-doctor/react)
[![downloads](https://img.shields.io/npm/dm/@framework-doctor/react.svg?style=flat)](https://npmjs.com/package/@framework-doctor/react)

Diagnose and improve your React codebase health.

One command scans your codebase for security, performance, correctness, and architecture issues, then outputs a **0–100 score** with actionable diagnostics.

## How it works

React Doctor detects your framework (Next.js, Vite, Remix, etc.), React version, and compiler setup, then runs two analysis passes **in parallel**:

1. **Lint**: Checks 60+ rules across state & effects, performance, architecture, bundle size, security, correctness, accessibility, and framework-specific categories (Next.js, React Native). Rules are toggled automatically based on your project setup.
2. **Dead code**: Detects unused files, exports, types, and duplicates.

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

Add the React Doctor skill so your AI assistant knows all 47+ React best practice rules:

Copy `.cursor/skills/framework-doctor` from this repo into your project or global Cursor skills.

## Options

```
Usage: react-doctor [directory] [options]

Options:
  -v, --version     display the version number
  --no-lint         skip linting
  --no-dead-code    skip dead code detection
  --verbose         show file details per rule
  --score           output only the score
  -y, --yes         skip prompts, scan all workspace projects
  --project <name>  select workspace project (comma-separated for multiple)
  --diff [base]     scan only files changed vs base branch
  --no-ami          skip Ami-related prompts
  --fix             open Ami to auto-fix all issues
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

If both exist, `react-doctor.config.json` takes precedence.

### Config options

| Key            | Type                | Default | Description                                                                                                                         |
| -------------- | ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ignore.rules` | `string[]`          | `[]`    | Rules to suppress, using the `plugin/rule` format shown in diagnostic output (e.g. `react/no-danger`, `knip/exports`, `knip/types`) |
| `ignore.files` | `string[]`          | `[]`    | File paths to exclude, supports glob patterns (`src/generated/**`, `**/*.test.tsx`)                                                 |
| `lint`         | `boolean`           | `true`  | Enable/disable lint checks (same as `--no-lint`)                                                                                    |
| `deadCode`     | `boolean`           | `true`  | Enable/disable dead code detection (same as `--no-dead-code`)                                                                       |
| `verbose`      | `boolean`           | `false` | Show file details per rule (same as `--verbose`)                                                                                    |
| `diff`         | `boolean \| string` | —       | Force diff mode (`true`) or pin a base branch (`"main"`). Set to `false` to disable auto-detection.                                 |

CLI flags always override config values.

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
