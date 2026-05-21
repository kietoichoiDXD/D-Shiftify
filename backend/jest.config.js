module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Roots and paths
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/core/bin/**',
        '!src/**/*.config.js',
        '!src/core/infrastructure/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },

    // Transform files
    transform: {
        '^.+\\.js$': 'babel-jest',
    },

    // Module name mapper for path aliases (matching jsconfig.json)
    moduleNameMapper: {
        '^core/(.*)$': '<rootDir>/src/core/$1',
        '^packages/(.*)$': '<rootDir>/src/packages/$1',
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

    // Ignore patterns
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transformIgnorePatterns: [
        '/node_modules/',
        '\\.pnp\\.js$',
    ],

    // Timeout
    testTimeout: 30000,

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,
    restoreMocks: true,

    // Coverage thresholds
    bail: false,

    // Logging
    silent: false,

    // Module file extensions
    moduleFileExtensions: ['js', 'json', 'node'],

    // Watchman
    watchman: true,
};
