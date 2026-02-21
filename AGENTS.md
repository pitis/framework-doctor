## General Rules

- MUST: Use TypeScript interfaces over types.
- MUST: Keep all types in the global scope.
- MUST: Use arrow functions over function declarations
- MUST: Never comment unless absolutely necessary.
  - If the code is a hack (like a setTimeout or potentially confusing code), it must be prefixed with // HACK: reason for hack
- MUST: Use kebab-case for files
- MUST: Use descriptive names for variables (avoid shorthands, or 1-2 character names).
  - Example: for .map(), you can use `innerX` instead of `x`
  - Example: instead of `moved` use `didPositionChange`
- MUST: Frequently re-evaluate and refactor variable names to be more accurate and descriptive.
- MUST: Do not type cast ("as") unless absolutely necessary
- MUST: Remove unused code and don't repeat yourself.
- MUST: Always search the codebase before refactoring or adding features; think of many solutions, then implement the most _elegant_ solution.
- MUST: Put all magic numbers in `constants.ts` using `SCREAMING_SNAKE_CASE` with unit suffixes (`_MS`, `_PX`). In a monorepo, use per-package constants (e.g. `packages/foo/src/constants.ts`).
- MUST: Put small, focused utility functions in `utils/` with one utility per file. In a monorepo, use per-package utils (e.g. `packages/foo/src/utils/`).
- MUST: Use Boolean over !!.

## Testing

Run checks always before committing with:

```bash
pnpm quality:check
```

Or individually: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Use `pnpm format` to fix formatting.
