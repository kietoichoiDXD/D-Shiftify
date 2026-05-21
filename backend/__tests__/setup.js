/**
 * Jest Setup File
 * Configure global test settings
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_secret_key';

// Suppress console logs during tests (optional)
// global.console = {
//     ...console,
//     log: jest.fn(),
//     debug: jest.fn(),
//     info: jest.fn(),
//     warn: jest.fn(),
// };

// Add custom matchers if needed
expect.extend({
    toBeValidJSON(received) {
        try {
            JSON.parse(received);
            return {
                message: () => `expected ${received} not to be valid JSON`,
                pass: true,
            };
        } catch (e) {
            return {
                message: () => `expected ${received} to be valid JSON`,
                pass: false,
            };
        }
    },
});
