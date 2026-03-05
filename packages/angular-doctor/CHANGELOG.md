# @framework-doctor/angular

## 1.1.1

### Patch Changes

- included more security rules

## 1.1.0

### Minor Changes

- - Fix stale "coming soon" messaging: Angular is now listed as supported alongside Svelte, React, Vue
  - Add `--format json` for machine-readable output (score, diagnostics, projectInfo, elapsedMs)
  - Add `--watch` to re-scan on file changes (debounced)
  - Add `--fix` for auto-fixable lint issues (Svelte, React)
  - Add `--no-audit` to skip dependency vulnerability audit (default: audit enabled)
  - Add optional dependency audit integration (reports high/critical vulns via `pnpm audit`)
  - Add unified config via `framework-doctor.config.json` with shared options and framework sections
  - Add Angular reduced motion check (WCAG 2.3.3, motion libraries detection)
  - Add GitHub Action for CI (`action.yml` + workflow)
  - Optimize scan test suite (audit disabled in tests, fewer redundant scans)z

### Patch Changes

- Updated dependencies
  - @framework-doctor/core@1.1.0

## 1.0.4

### Patch Changes

- angular doctor
- Updated dependencies
  - @framework-doctor/core@1.0.4
