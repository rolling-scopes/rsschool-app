import testingLibrary from 'eslint-plugin-testing-library';
import defaultConfig from '../eslint.config.mjs';

export default [
  ...defaultConfig,
  {
    ...testingLibrary.configs['flat/react'],
    files: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  },
];
