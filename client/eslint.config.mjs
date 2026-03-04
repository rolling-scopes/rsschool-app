import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
      'import/resolver': {
        typescript: {
          project: path.join(path.dirname(fileURLToPath(import.meta.url)), 'tsconfig.json'),
        },
      },
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      'boundaries/ignore': ['src/**/*.css'],
      'boundaries/elements': [
        { type: 'pages', pattern: 'src/pages/**/*.{ts,tsx}', mode: 'file' },
        { type: 'modules', pattern: 'src/modules/*', capture: ['moduleName'] },
        { type: 'shared', pattern: 'src/shared/**/*.{ts,tsx}', mode: 'file' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'warn',
        {
          default: 'allow',
          rules: [
            {
              from: 'modules',
              disallow: 'modules',
              message: 'Modules must not import other modules directly.',
            },
            {
              from: 'shared',
              disallow: 'modules',
              message: 'Shared code must not import from modules.',
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
              message: "The 'jsx' attribute from styled-jsx is deprecated. Use CSS modules instead.",
            },
            {
              name: 'styled-jsx',
              message: "The 'jsx' attribute from styled-jsx is deprecated. Use CSS modules instead.",
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
