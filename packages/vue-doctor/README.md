# Vue Doctor

[![version](https://img.shields.io/npm/v/@framework-doctor/vue.svg?style=flat)](https://npmjs.com/package/@framework-doctor/vue)
[![downloads](https://img.shields.io/npm/dm/@framework-doctor/vue.svg?style=flat)](https://npmjs.com/package/@framework-doctor/vue)

Diagnose and improve your Vue and Nuxt codebase health.

One command scans your codebase for security, performance, correctness, dead code, and accessibility issues, then outputs a **0–100 score** with actionable diagnostics.

## Install

Run at your project root:

```bash
npx -y @framework-doctor/vue .
```

Or use the unified CLI (auto-detects Vue):

```bash
npx -y @framework-doctor/cli .
```

## Options

```
Usage: vue-doctor [directory] [options]

Options:
  -v, --version       display the version number
  --no-lint           skip linting
  --no-dead-code      skip dead code detection
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

Create `vue-doctor.config.json`:

```json
{
  "ignore": {
    "rules": ["vue/no-mutating-props", "vue-doctor/no-v-html"],
    "files": ["src/generated/**"]
  },
  "lint": true,
  "deadCode": true,
  "verbose": false,
  "diff": false,
  "analytics": true
}
```

Or use the `vueDoctor` key in `package.json`:

```json
{
  "vueDoctor": {
    "deadCode": true,
    "ignore": { "rules": ["vue-doctor/no-v-html"] }
  }
}
```

## Programmatic API

```typescript
import { diagnose } from '@framework-doctor/vue';

const result = await diagnose('./my-vue-project', {
  lint: true,
  deadCode: true,
  includePaths: [], // empty = full scan
});

console.log(result.diagnostics);
console.log(result.score);
console.log(result.project);
console.log(result.elapsedMilliseconds);
```

## Checks

Vue Doctor runs:

- **vue-tsc** — TypeScript type checking for `.vue` and `.ts` files
- **ESLint** — eslint-plugin-vue, eslint-plugin-vuejs-accessibility, @nuxt/eslint-plugin (Nuxt)
- **Security** — v-html, eval, new Function, implied eval
- **Knip** — Dead code detection
- **checkReducedMotion** — Accessibility (WCAG 2.3.3) when motion libraries are used

## Security checks

Vue Doctor flags:

- **`v-html`** — Raw HTML can lead to XSS if content is unsanitized
- **`new Function()`** — Code injection risk
- **`setTimeout("string")` / `setInterval("string")`** — Implied eval

## License

MIT
