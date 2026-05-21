# Testing Guide

## Overview
This project uses Jest for unit and integration testing with comprehensive test coverage.

## Test Structure

```
__tests__/
├── setup.js                 # Global test configuration
├── unit/                    # Unit tests
│   └── error-code.unit.test.js
└── integration/             # Integration tests
    └── exceptions.integration.test.js
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (rerun on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

## Test Naming Convention

- **Unit Tests**: `*.unit.test.js` - Test individual functions/classes in isolation
- **Integration Tests**: `*.integration.test.js` - Test multiple components together
- **API Tests**: `*.api.test.js` - Test HTTP endpoints

## Example: Writing a Unit Test

```javascript
// src/utils/__tests__/calculateTotal.unit.test.js
import { calculateTotal } from '../calculateTotal';

describe('calculateTotal', () => {
    test('should sum all numbers', () => {
        expect(calculateTotal([1, 2, 3])).toBe(6);
    });

    test('should return 0 for empty array', () => {
        expect(calculateTotal([])).toBe(0);
    });

    test('should throw error for invalid input', () => {
        expect(() => calculateTotal('invalid')).toThrow();
    });
});
```

## Example: Writing an Integration Test

```javascript
// __tests__/integration/auth.integration.test.js
import request from 'supertest';
import app from '../../src/core/index';

describe('Auth Endpoints', () => {
    test('POST /api/auth/login should return token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
```

## Mocking

### Mock Dependencies
```javascript
jest.mock('../../src/core/database', () => ({
    connection: {
        raw: jest.fn().mockResolvedValue([]),
    },
}));
```

### Mock Functions
```javascript
const mockFn = jest.fn();
mockFn.mockReturnValue('mocked value');
mockFn.mockResolvedValue({ data: [] });
mockFn.mockRejectedValue(new Error('error'));
```

## Coverage Goals

- **Branches**: 50%+
- **Functions**: 50%+
- **Lines**: 50%+
- **Statements**: 50%+

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Best Practices

1. **One Assertion Per Test** (when possible)
   ```javascript
   // Good
   test('should return user by id', () => {
       const user = getUserById(1);
       expect(user.id).toBe(1);
   });
   ```

2. **Use Descriptive Test Names**
   ```javascript
   // Good
   test('should throw BadRequestException when email is invalid')
   
   // Bad
   test('email validation')
   ```

3. **Setup and Teardown**
   ```javascript
   beforeEach(() => {
       // Setup before each test
   });

   afterEach(() => {
       // Cleanup after each test
   });
   ```

4. **Mock External Dependencies**
   ```javascript
   jest.mock('axios');
   axios.get.mockResolvedValue({ data: {} });
   ```

5. **Test Error Cases**
   ```javascript
   test('should throw error when user not found', () => {
       expect(() => getUser(-1)).toThrow(NotFoundException);
   });
   ```

## Continuous Integration

Tests run automatically on:
- Git commit (pre-commit hook via husky)
- Pull request
- Before deployment

Ensure all tests pass before merging!

## Debugging Tests

Run single test file:
```bash
npx jest __tests__/unit/error-code.unit.test.js
```

Run with detailed output:
```bash
jest --verbose
```

Debug in Chrome:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Jest Mock Extended](https://github.com/NiGhTTraP/jest-mock-extended)
