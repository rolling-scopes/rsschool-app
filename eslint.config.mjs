import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';
import turbo from 'eslint-config-turbo/flat';
import globals from 'globals';
import jest from 'eslint-plugin-jest';

const IS_AGENT =
  Boolean(process.env.AGENT) ||
  Boolean(process.env.OPENCODE) ||
  Boolean(process.env.CLAUDECODE) ||
  Boolean(process.env.CURSOR_AGENT) ||
  Boolean(process.env.CODEX_THREAD_ID);

export default tsEslint.config(
  eslint.configs.recommended,
  tsEslint.configs.recommended,
  ...turbo,
  {
    files: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    ...jest.configs['flat/recommended'],
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
      '@typescript-eslint/no-explicit-any': IS_AGENT ? 'off' : 'warn',
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
