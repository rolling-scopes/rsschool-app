const nextJest = require('next/jest');

process.env.TZ = 'UTC';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  testEnvironment: 'jest-environment-jsdom',
  rootDir: 'src',
  setupFilesAfterEnv: ['<rootDir>/__mocks__/setupJest.ts'],
  moduleNameMapper: {
    '^api$': '<rootDir>/api',
    '^api(.*)$': '<rootDir>/api/$1',
    '^data(.*)$': '<rootDir>/data/$1',
    '^components(.*)$': '<rootDir>/components/$1',
    '^services(.*)$': '<rootDir>/services/$1',
    '^utils(.*)$': '<rootDir>/utils/$1',
    '^configs(.*)$': '<rootDir>/configs/$1',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
