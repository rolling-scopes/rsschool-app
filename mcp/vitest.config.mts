import { defineConfig, mergeConfig } from 'vitest/config';
import shared from '../vitest.shared.mjs';

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      include: ['src/**/*.spec.ts'],
      env: { TZ: 'UTC' },
      coverage: {
        include: ['src/**/*.ts'],
        exclude: [
          'src/**/*.spec.ts',
          'src/test-utils.ts', // test-only helper, excluded from the build too
          'src/server.ts', // thin stdio bootstrap (config -> resolveUser -> connect)
          'src/http-main.ts', // thin HTTP bootstrap around http-server.ts
        ],
        reportsDirectory: './coverage',
        // The workspace is small and fully unit-testable, so the gate is a
        // hard 100% — any untested branch in a new tool fails CI.
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  }),
);
