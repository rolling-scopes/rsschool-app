module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'testing-library', 'jest'],
  extends: [
    'eslint:recommended',
    'next',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest-dom/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'turbo',
  ],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    '@next/next/no-img-element': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    'import/no-anonymous-default-export': 0,
    'jsx-a11y/alt-text': 0,
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'react-hooks/exhaustive-deps': 0,
    'react/display-name': 0,
    'react/jsx-no-target-blank': 0,
    'react/no-unescaped-entities': 0,
    'react/no-unknown-property': [2, { ignore: ['jsx', 'global', 'p-id'] }],
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
  },
  overrides: [
    {
      // Enable eslint-plugin-testing-library rules or preset only for matching testing files
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      excludedFiles: 'specs/**/*',
      extends: ['plugin:testing-library/react', 'plugin:testing-library/dom'],
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
