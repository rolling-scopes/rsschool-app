export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: ['.*\\.spec\\.ts$', 'test\\.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/../../common/$1',
    '^@entities(.*)$': '<rootDir>/../../server/src/models/$1',
    '^src/(.*)$': '<rootDir>/$1',
  },
  clearMocks: true,
};
