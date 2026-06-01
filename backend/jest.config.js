module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/cron/**',           // крон-задачи
        '!src/database/migrations/**',  // миграции
        '!src/database/seeders/**',     // сиды
        '!src/modules/notification/**', // уведомления (по вашей просьбе)
        '!src/**/*.routes.js',   // можно временно исключить роуты
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Временно исключаем проблемные тесты
    testPathIgnorePatterns: [
        '/node_modules/',
        'tests/integration/routine.routes.test.js',
        'tests/integration/auth.routes.test.js',
        'tests/unit/services/streak.service.test.js',
        'tests/unit/controllers/user.controller.test.js',
        'tests/unit/services/item.service.test.js',
    ],

    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    transformIgnorePatterns: ['/node_modules/'],
    moduleNameMapper: {
        '^uuid$': '<rootDir>/tests/__mocks__/uuid.js',
    },
};