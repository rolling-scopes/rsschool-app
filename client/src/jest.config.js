module.exports = {
  setupFiles: [
    '<rootDir>/__mocks__/setupJest.ts',
  ],
  moduleNameMapper: {
    '^components(.*)$': '<rootDir>/components/$1',
    '^services(.*)$': '<rootDir>/services/$1',
    '^utils(.*)$': '<rootDir>/utils/$1',
  },
};
