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
        // Ratcheted floor enforced in CI: starts just below the post-exclude
        // baseline so this config-only change passes, then bumps up as each
        // unit-test tier lands so coverage can only move up, never regress.
        thresholds: {
          statements: 34,
          branches: 32,
          functions: 27,
          lines: 34,
        },
      },
      deps: {
        interopDefault: true,
      },
    },
  }),
);
