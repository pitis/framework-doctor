# CLI Commands and Flags

## Common Flags

| Flag            | Description                              | Example                                         |
| --------------- | ---------------------------------------- | ----------------------------------------------- |
| `--verbose`     | Show file-level details per rule         | `npx -y @framework-doctor . --verbose`          |
| `--diff`        | Scan only changed files (vs base branch) | `npx -y @framework-doctor . --diff`             |
| `--diff <base>` | Scan only changed files vs specific base | `npx -y @framework-doctor . --diff origin/main` |
| `--score`       | Output only the score (no details)       | `npx -y @framework-doctor . --score`            |

## Recommended Usage

```bash
# Full scan with details
npx -y @framework-doctor . --verbose --diff
```

Use `--diff` to speed up scans by only checking changed files. Use `--verbose` to see which files trigger each rule.

## Exit Codes

- `0` — Scan completed, score available
- `1` — Errors (e.g. unsupported framework, scan failure)
