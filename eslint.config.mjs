import eslint from '@eslint/js';
import turbo from 'eslint-config-turbo/flat';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import { isAgent } from 'std-env';

export default tsEslint.config(
  eslint.configs.recommended,
  tsEslint.configs.recommended,
  ...turbo,
  {
    files: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    ...vitest.configs.recommended,
  },
  {
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': isAgent ? 'off' : 'warn',
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
      'no-else-return': ['error'],
    },
  },
);
