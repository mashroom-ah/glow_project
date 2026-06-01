module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/cron/**',
    '!src/database/migrations/**',
    '!src/database/seeders/**',
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
  // Пороги покрытия временно отключены
  // coverageThreshold: {
  //   global: {
  //     statements: 60,
  //     branches: 50,
  //     functions: 60,
  //     lines: 60,
  //   },
  //   './src/utils/**/*.js': {
  //     statements: 90,
  //     branches: 85,
  //     functions: 100,
  //     lines: 90,
  //   },
  // },
};