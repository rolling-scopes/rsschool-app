import boundaries from 'eslint-plugin-boundaries';
import testingLibrary from 'eslint-plugin-testing-library';
import defaultConfig from '../eslint.config.mjs';

export default [
  ...defaultConfig,
  {
    ...testingLibrary.configs['flat/react'],
    files: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'pages', pattern: 'src/pages/*', mode: 'full', capture: ['pageName'] },
        { type: 'modules', pattern: 'src/modules/*', mode: 'full', capture: ['moduleName'] },
        { type: 'shared', pattern: 'src/shared/*', mode: 'full', capture: ['sharedName'] },
        { type: 'entities', pattern: 'src/entities/*', mode: 'full', capture: ['entityName'] },
        { type: 'providers', pattern: 'src/providers/*', mode: 'full', capture: ['providerName'] },
        { type: 'api', pattern: 'src/api/*', mode: 'full', capture: ['apiName'] },
        { type: 'styles', pattern: 'src/styles/*', mode: 'full', capture: ['styleName'] },
        { type: 'configs', pattern: 'src/configs/*', mode: 'full', capture: ['configName'] },
        { type: 'components', pattern: 'src/components/*', mode: 'full', capture: ['componentName'] },
        { type: 'services', pattern: 'src/services/*', mode: 'full', capture: ['serviceName'] },
        { type: 'domain', pattern: 'src/domain/*', mode: 'full', capture: ['domainName'] },
        { type: 'data', pattern: 'src/data/*', mode: 'full', capture: ['dataName'] },
        { type: 'utils', pattern: 'src/utils/*', mode: 'full', capture: ['utilName'] },
        { type: 'hooks', pattern: 'src/hooks/*', mode: 'full', capture: ['hookName'] },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['modules'],
              disallow: ['modules'],
              message: 'Modules must not import other modules directly.',
            },
            {
              from: ['shared'],
              disallow: ['modules'],
              message: 'Shared code must not import from modules.',
            },
            {
              from: ['entities'],
              disallow: ['modules', 'shared', 'pages', 'providers'],
              message: 'Entities must remain pure and independent of app layers.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'styled-jsx/css',
              message: 'styled-jsx is deprecated. Use CSS modules instead.',
            },
            {
              name: 'styled-jsx',
              message: 'styled-jsx is deprecated. Use CSS modules instead.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='jsx']",
          message: "The 'jsx' attribute from styled-jsx is deprecated. Use CSS modules instead.",
        },
      ],
    },
  },
];
