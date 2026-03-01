# @framework-doctor/cli

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
  - @framework-doctor/svelte@1.1.0
  - @framework-doctor/react@1.1.0
  - @framework-doctor/vue@1.1.0
  - @framework-doctor/angular@1.1.0

## 1.0.4

### Patch Changes

- angular doctor
- Updated dependencies
  - @framework-doctor/angular@1.0.4
  - @framework-doctor/svelte@1.0.4
  - @framework-doctor/react@1.0.4
  - @framework-doctor/vue@1.0.4

## 1.0.3

### Patch Changes

- vue doctor
- Updated dependencies
  - @framework-doctor/svelte@1.0.3
  - @framework-doctor/react@1.0.3
  - @framework-doctor/vue@1.0.3

## Unreleased

### Minor Changes

- Add Vue support: auto-detect vue/nuxt and run @framework-doctor/vue
- Remove Vue from "coming soon"; Angular remains coming soon

## 1.0.2

### Patch Changes

- Version alignment
- added telemetry and refactored core
- Updated dependencies
  - @framework-doctor/svelte@1.0.2
  - @framework-doctor/react@1.0.2

## 1.1.0

### Minor Changes

- b0823b0: Add unified CLI that auto-detects framework from package.json and runs the appropriate doctor. Run `npx @framework-doctor/cli .` instead of `npx @framework-doctor/svelte .`.

### Patch Changes

- Updated docs
- Updated dependencies [cb322c3]
- Updated dependencies
  - @framework-doctor/react@1.0.1
  - @framework-doctor/svelte@1.0.1

## 1.1.0

### Minor Changes

- Updated docs
- b0823b0: Add unified CLI that auto-detects framework from package.json and runs the appropriate doctor. Run `npx @framework-doctor/cli .` instead of `npx @framework-doctor/svelte .`.

### Patch Changes

- Updated dependencies
- Updated dependencies [cb322c3]
  - @framework-doctor/react@1.1.0
  - @framework-doctor/svelte@1.1.0
