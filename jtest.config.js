module.exports = {
    testEnvironment: 'node',

    setupFilesAfterEnv: [
        '<rootDir>/__tests__/jest.setup.js',
    ],

    testTimeout: 30000,

    collectCoverage: true,

    coverageDirectory: 'coverage',

    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
    ],
};