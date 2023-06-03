// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

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

const createJestConfig = nextJest({ dir: './' });

module.exports = async () => {
  const config = await createJestConfig({
    testEnvironment: 'jsdom',
    rootDir: 'src',
    setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
    moduleDirectories: ['node_modules', '<rootDir>/'],
  })();
  config.transformIgnorePatterns = [`[/\\\\]node_modules[/\\\\](?!${esModules}).+\\.(js|jsx|mjs|cjs|ts|tsx)$`];
  return config;
};
