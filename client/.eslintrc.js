module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'testing-library', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/dom',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@next/next/no-img-element': 0,
    'react/react-in-jsx-scope': 0,
    'react/display-name': 0,
    'react/no-unescaped-entities': 0,
    'react/no-unknown-property': [2, { ignore: ['jsx', 'global'] }],
    'react/jsx-no-target-blank': 0,
  },
  overrides: [
    {
      // Enable eslint-plugin-testing-library rules or preset only for matching testing files
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
