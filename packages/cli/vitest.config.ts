import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 5_000,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 40,
        statements: 50,
      },
    },
  },
});
