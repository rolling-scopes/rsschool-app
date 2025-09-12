import defaultConfig from '../eslint.config.mjs';

export default [
  ...defaultConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
    },
  },
];
