import testingLibrary from 'eslint-plugin-testing-library';
import defaultConfig from '../eslint.config.mjs';

export default [
  ...defaultConfig,
  {
    ...testingLibrary.configs['flat/react'],
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  },
];
