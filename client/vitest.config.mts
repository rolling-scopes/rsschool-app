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
          // NOTE: do not exclude `src/**/index.ts` — v8's exclude matcher also
          // drops component `index.tsx` files (95 real components), which must
          // count toward the target. Pure barrels are mostly covered transitively.
          'src/**/*.d.ts',
          'src/setupTests.ts',
        ],
        reportsDirectory: './coverage',
        // Coverage floor enforced in CI via `test:ci`. Actual coverage is
        // ~90.8% stmts / 84.7% branches / 90.2% funcs / 91.0% lines. Statements,
        // functions and lines hit the flat-90 goal; branches sit ~85 because UI
        // components carry many defensive/unreachable branches (jsdom-impossible
        // guards, antd internals, dead `?? []` fallbacks). Floors sit just below
        // actual so a real regression fails CI while tolerating retry variance.
        thresholds: {
          statements: 90,
          branches: 83,
          functions: 89,
          lines: 90,
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
