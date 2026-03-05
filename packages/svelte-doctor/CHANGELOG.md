# svelte-doctor

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

## 1.0.3

### Patch Changes

- vue doctor
- Updated dependencies
  - @framework-doctor/core@1.0.3

## Unreleased

### Minor Changes

- Add security scan to `scan()` so `diagnose()` matches CLI
- Add selectProjects, --project multi-project support
- Add maybePromptSkillInstall, handleError, checkReducedMotion
- Add writeDiagnosticsDirectory, addHelpText, resolveDiffMode prompt
- Refactor CLI to use `scan()` for single source of truth

## 1.0.2

### Patch Changes

- added telemetry and refactored core
- Updated dependencies
  - @framework-doctor/core@1.0.2

## 1.0.1

### Patch Changes

- cb322c3: Initial release for Svelte and React doctors
- Updated docs

## 1.0.0

### Major Changes

- Release `svelte-doctor` 1.0.0 with initial Svelte 5 diagnostics, dead-code detection, scoring, and CI/release tooling.
