# Svelte Doctor

Svelte Doctor diagnoses Svelte project health with actionable diagnostics and a 0-100 score.

## Quick start

Run in a Svelte project root:

```bash
npx -y svelte-doctor@latest .
```

## CLI commands people will use

- `npx -y svelte-doctor@latest .` - run a full scan.
- `npx -y svelte-doctor@latest ./path/to/project` - scan a specific project directory.
- `npx -y svelte-doctor@latest . --verbose` - include file and line details.
- `npx -y svelte-doctor@latest . --score` - print only the numeric score (CI-friendly).
- `npx -y svelte-doctor@latest . --no-js-ts-lint` - only run Svelte checks (skip JS/TS linting).
- `npx -y svelte-doctor@latest . --diff main` - scan only files changed against `main`.
- `npx -y svelte-doctor@latest . --project web` - select a specific workspace package.

## Options

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

## Configuration

Create `svelte-doctor.config.json`:

```json
{
  "ignore": {
    "rules": ["svelte-check/a11y-missing-attribute"],
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
