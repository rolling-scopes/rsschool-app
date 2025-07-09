import next from 'next/jest.js';

// eslint-disable-next-line turbo/no-undeclared-env-vars, no-undef
process.env.TZ = 'UTC';

const esModules = [
  'react-markdown',
  'vfile',
  'unist-.+',
  'remark-.+',
  'mdast-util-.+',
  'unified',
  'bail',
  'is-plain-obj',
  'trough',
  'micromark',
  'parse-entities',
  'character-entities',
  'property-information',
  'comma-separated-tokens',
  'hast-util-whitespace',
  'space-separated-tokens',
  'decode-named-character-reference',
  'ccount',
  'escape-string-regexp',
  'markdown-table',
  'trim-lines',
].join('|');

const createJestConfig = next({ dir: './' });

export default async () => {
  const config = await createJestConfig({
    testEnvironment: 'jsdom',
    rootDir: 'src',
    setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
    moduleDirectories: ['node_modules', '<rootDir>/'],
    testTimeout: 30000,
  })();
  config.transformIgnorePatterns = [`[/\\\\]node_modules[/\\\\](?!${esModules}).+\\.(js|jsx|mjs|cjs|ts|tsx)$`];
  return config;
};
