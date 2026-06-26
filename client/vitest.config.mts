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
        'next/router': path.resolve(import.meta.dirname, 'src/__mocks__/next/router'),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      setupFiles: ['src/setupTests.ts'],
      // antd v6 in jsdom is CPU-heavy; under coverage instrumentation + parallelism
      // the slowest Table/Form-validation tests can exceed 30s on busy/CI runners.
      testTimeout: 60000,
      hookTimeout: 60000,
      // Retry transient flakes (antd async validation/Table renders occasionally
      // timing out under load). A genuine failure still fails all attempts.
      retry: 2,
      env: {
        TZ: 'UTC',
      },
      css: false,
      coverage: {
        include: ['src/**/*.{ts,tsx}'],
        // Measure real component/hook/service logic — exclude generated, route
        // shims, static, presentational-only and test/support files.
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/__tests__/**',
          'src/__mocks__/**',
          'src/api/**', // generated OpenAPI client
          'src/pages/**', // Next.js route shims (module-level */pages/* components stay)
          'src/data/**',
          'src/configs/**',
          'src/styles/**',
          'src/shared/components/Icons/**',
          'src/**/*.stories.tsx',
          'src/**/index.ts', // barrel re-exports
          'src/**/*.d.ts',
          'src/setupTests.ts',
        ],
        reportsDirectory: './coverage',
        // Ratcheted floor enforced in CI via `test:ci`: starts just below the
        // post-exclude baseline so this config-only change passes, then bumps up
        // as each test tier lands, ending at a flat 90% (free above 90, fail below).
        thresholds: {
          statements: 50,
          branches: 46,
          functions: 47,
          lines: 50,
        },
      },
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
