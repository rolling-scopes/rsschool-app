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
        src: path.resolve(import.meta.dirname, 'src'),
      },
    },
    test: {
      include: ['src/**/*.test.ts'],
      // All route handlers/services have been migrated to NestJS; the Koa app retains only
      // bootstrap + cron code with no unit tests, so an empty run must not fail CI.
      passWithNoTests: true,
      env: {
        NODE_ENV: 'test',
      },
    },
  }),
);
