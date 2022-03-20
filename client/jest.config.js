const nextJest = require('next/jest');

process.env.TZ = 'UTC';

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  rootDir: 'src',
  setupFilesAfterEnv: ['<rootDir>/__mocks__/setupJest.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
});
