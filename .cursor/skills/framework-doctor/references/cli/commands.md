# CLI Commands and Flags

## Common Flags

| Flag            | Description                               | Example                                             |
| --------------- | ----------------------------------------- | --------------------------------------------------- |
| `--verbose`     | Show file-level details per rule          | `npx -y @framework-doctor/cli . --verbose`          |
| `--diff`        | Scan only changed files (vs base branch)  | `npx -y @framework-doctor/cli . --diff`             |
| `--diff <base>` | Scan only changed files vs specific base  | `npx -y @framework-doctor/cli . --diff origin/main` |
| `--score`       | Output only the score (no details)        | `npx -y @framework-doctor/cli . --score`            |
| `--format json` | Machine-readable JSON output (CI/tooling) | `npx -y @framework-doctor/cli . --format json -y`   |
| `--watch`       | Re-scan on file changes                   | `npx -y @framework-doctor/cli . --watch`            |
| `--fix`         | Auto-fix lint issues (Svelte, React)      | `npx -y @framework-doctor/svelte . --fix`           |
| `--no-audit`    | Skip dependency vulnerability audit       | `npx -y @framework-doctor/cli . --no-audit`         |

## Recommended Usage

```bash
# Full scan with details
npx -y @framework-doctor/cli . --verbose --diff

# CI: machine-readable output
npx -y @framework-doctor/cli . --format json -y

# Development: watch and re-scan on changes
npx -y @framework-doctor/cli . --watch
```

Use `--diff` to speed up scans by only checking changed files. Use `--verbose` to see which files trigger each rule. Use `--format json` for CI or scripted parsing.

## Exit Codes

- `0` — Scan completed, score available
- `1` — Errors (e.g. unsupported framework, scan failure)
