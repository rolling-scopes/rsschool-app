import path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import shared from '../vitest.shared.mjs';

export default mergeConfig(
  shared,
  defineConfig({
    resolve: {
      alias: {
        '@client/hooks': path.resolve(import.meta.dirname, 'src/__mocks__/hooks'),
        '@client': path.resolve(import.meta.dirname, 'src'),
        'next/config': path.resolve(import.meta.dirname, 'src/__mocks__/next/config'),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      setupFiles: ['src/setupTests.ts'],
      testTimeout: 30000,
      env: {
        TZ: 'UTC',
      },
      css: false,
      deps: {
        optimizer: {
          web: {
            include: [
              'react-markdown',
              'vfile',
              'unist-util-stringify-position',
              'remark-parse',
              'remark-rehype',
              'mdast-util-from-markdown',
              'mdast-util-to-hast',
              'unified',
              'bail',
              'is-plain-obj',
              'trough',
              'micromark',
              'parse-entities',
              'character-entities',
              'property-information',
              'comma-separated-tokens',
              'hast-util-whitespace',
              'space-separated-tokens',
              'decode-named-character-reference',
              'ccount',
              'escape-string-regexp',
              'markdown-table',
              'trim-lines',
            ],
          },
        },
      },
    },
  }),
);
