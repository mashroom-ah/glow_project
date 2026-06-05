module.exports = {
  testEnvironment: 'node',
  verbose: true,
  
  // ВАЖНО: исключаем из покрытия то, что не нужно тестировать
  collectCoverageFrom: [
    'src/**/*.js',
    // Исключаем модели БД (они тестируются через интеграционные тесты)
    '!src/database/models/**',
    '!src/database/migrations/**',
    '!src/database/seeders/**',
    // Исключаем конфиги
    '!src/config/**',
    // Исключаем cron (по вашему запросу)
    '!src/cron/**',
    // Исключаем notification (по вашему запросу)
    '!src/modules/notification/**',
    // Исключаем маршруты (они тестируются через интеграционные тесты)
    '!src/**/*.routes.js',
    // Исключаем server.js
    '!src/server.js',
    // Исключаем weather.service (требует реального API)
    '!src/services/weather.service.js',
    // Исключаем старый файл (дубль)
    '!src/utils/calculateExpirationDate.js',
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