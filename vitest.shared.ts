import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest base configuration for all workspaces.
 * Each workspace extends this via `mergeConfig`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'common'),
    },
  },
  test: {
    globals: true,
    clearMocks: true,
  },
});
