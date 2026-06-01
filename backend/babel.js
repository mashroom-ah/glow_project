module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/migrations/**',
    '!src/database/seeders/**',
    '!src/cron/**',
    '!src/modules/notification/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.js',
  },
};