import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';
import turbo from 'eslint-config-turbo/flat';
import globals from 'globals';

export default tsEslint.config(eslint.configs.recommended, tsEslint.configs.recommended, ...turbo, {
  ignores: ['node_modules', 'dist'],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.browser,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
});
