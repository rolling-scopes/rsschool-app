import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig, mergeConfig } from 'vitest/config';
import shared from '../vitest.shared.mjs';

export default mergeConfig(
  shared,
  defineConfig({
    plugins: [
      swc.vite({
        module: { type: 'es6' },
      }),
    ],
    resolve: {
      alias: {
        '@entities': path.resolve(import.meta.dirname, 'src/models'),
        src: path.resolve(import.meta.dirname, 'src'),
      },
    },
    test: {
      include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
      // Pin the timezone so date/calendar assertions are deterministic and match
      // CI (GitHub runners are UTC); otherwise tests bake in the dev's local TZ.
      env: { TZ: 'UTC' },
      coverage: {
        include: ['src/**/*.(t|j)s'],
        // Exclude non-logic files so coverage measures real branching logic.
        exclude: [
          'src/**/*.spec.ts',
          'src/**/*.test.ts',
          'src/**/migrations/**',
          'src/**/*.module.ts',
          'src/**/dto/**',
          'src/**/*.dto.ts',
          'src/models/**', // pure TypeORM entities
          'src/**/index.ts', // barrel re-export files (no testable logic)
          'src/**/*.decorator.ts',
          'src/**/*.constants.ts',
          'src/**/*.{types,enum,interface}.ts',
          'src/**/types.ts', // pure type-alias files (no runtime logic)
          'src/**/*.d.ts',
          'src/main.ts',
          'src/setup.ts',
          'src/data-source.ts',
          'src/ormconfig.ts',
          'src/openapi-spec.ts',
          'src/constants.ts',
        ],
        reportsDirectory: './coverage',
        // Coverage floor: a flat 90% — the project's quality bar, NOT pinned to
        // the current ~99.6%. Intent: coverage may move freely as long as it
        // stays >= 90% (a refactor that drops 99.6% -> 92% is fine and won't
        // fail CI); only dropping below 90% fails. We deliberately avoid
        // vitest's `autoUpdate` ratchet, which would keep raising the floor
        // toward 100% and then fail on any dip below the new high-water mark.
        thresholds: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
      deps: {
        interopDefault: true,
      },
    },
  }),
);
