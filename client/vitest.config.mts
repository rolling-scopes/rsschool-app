import path from 'node:path';
import { isBuiltin } from 'node:module';
import { defineConfig, mergeConfig } from 'vitest/config';
import shared from '../vitest.shared.mjs';

// Set UTC before workers start because threads inherit the parent timezone.
process.env.TZ = 'UTC';

// Keep this list explicit: some service and .test.ts files need browser APIs.
const nodeTests = [
  'src/data/interviews/__tests__/templateValidator.test.ts',
  'src/domain/course.test.ts',
  'src/domain/interview.test.ts',
  'src/domain/user.helpers.test.ts',
  'src/modules/AutoTest/utils/map.test.ts',
  'src/modules/CrossCheck/components/SolutionReview/helpers.test.ts',
  'src/modules/CrossCheck/utils/arrayMoveImmutable.test.ts',
  'src/modules/CrossCheck/utils/getCriteriaStatusColor.test.ts',
  'src/modules/Home/data/loadHomeData.test.ts',
  'src/modules/Interviews/data/getInterviewData.test.ts',
  'src/modules/Interviews/data/getStageInterviewData.test.ts',
  'src/modules/Interviews/pages/StageInterviewFeedback/feedbackTemplateHandler.test.ts',
  'src/modules/MentorsHallOfFame/services/mentors-hall-of-fame.service.test.ts',
  'src/modules/Opportunities/pages/PublicPage/getServerSideProps.test.ts',
  'src/modules/Opportunities/transformers/splitDataForForms.test.ts',
  'src/modules/Opportunities/transformers/transformFieldsData.test.ts',
  'src/modules/Opportunities/transformers/transformInitialCvData.test.ts',
  'src/modules/Score/data/getExportCsvUrl.test.ts',
  'src/modules/Score/data/isExportEnabled.test.ts',
  'src/modules/SubmitScores/utils.test.ts',
  'src/modules/Tasks/utils/test-utils.test.ts',
  'src/services/cdn.test.ts',
  'src/services/courses.test.ts',
  'src/services/features.test.ts',
  'src/services/files.test.ts',
  'src/services/formatter.test.ts',
  'src/services/gratitude.test.ts',
  'src/services/mentorRegistry.test.ts',
  'src/services/routes.test.ts',
  'src/services/validators.test.ts',
  'src/shared/utils/queryParams-utils.test.ts',
  'src/shared/utils/text-utils.test.ts',
  'src/utils/optionalQueryString.test.ts',
  'src/utils/profilePageUtils.test.ts',
];

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
      projects: [
        {
          test: {
            name: 'node',
            environment: 'node',
            include: nodeTests,
          },
        },
        {
          // Bundle ESM exports so named icon imports survive dependency optimization.
          resolve: { mainFields: ['module', 'main'] },
          test: {
            name: 'dom',
            environment: 'jsdom',
            include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
            exclude: nodeTests,
            setupFiles: ['src/setupTests.ts'],
            deps: {
              optimizer: {
                client: {
                  enabled: true,
                  // Share dayjs plugin state and React contexts with unbundled imports.
                  exclude: ['react-dom', '@ant-design/cssinjs'],
                  rolldownOptions: {
                    platform: 'node',
                    external: id => id === 'dayjs' || isBuiltin(id),
                  },
                  include: ['antd', '@ant-design/icons', 'react-markdown', 'remark-gfm'],
                },
              },
            },
          },
        },
      ],
      // Keep file isolation: tests use different module mocks and browser state.
      pool: 'threads',
      // antd v6 in jsdom is CPU-heavy; under coverage instrumentation + parallelism
      // the slowest Table/Form-validation tests can exceed 30s on busy/CI runners.
      testTimeout: 60000,
      hookTimeout: 60000,
      // Surface flaky failures instead of hiding them behind repeated minute-long attempts.
      retry: 0,
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
          // Keep barrels in coverage so the measured file set stays unchanged.
          'src/**/*.d.ts',
          'src/setupTests.ts',
        ],
        reportsDirectory: './coverage',
        // Enforce the same coverage floor across both projects in CI.
        thresholds: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  }),
);
