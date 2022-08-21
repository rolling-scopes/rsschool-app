const nextJest = require('next/jest');

process.env.TZ = 'UTC';

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  rootDir: 'src',
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
});
