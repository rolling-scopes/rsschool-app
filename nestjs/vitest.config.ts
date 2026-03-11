import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig, mergeConfig } from 'vitest/config';
import shared from '../vitest.shared';

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
        '@entities': path.resolve(__dirname, '../server/src/models'),
        src: path.resolve(__dirname, 'src'),
      },
    },
    test: {
      include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
      coverage: {
        include: ['src/**/*.(t|j)s'],
        reportsDirectory: './coverage',
      },
      deps: {
        interopDefault: true,
      },
    },
  }),
);
