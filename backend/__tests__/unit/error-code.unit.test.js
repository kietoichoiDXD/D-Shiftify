/**
 * Example Unit Test
 * 
 * Run: npm run test:unit
 */

import { ERROR_CODE } from 'packages/httpException/error.enum';

describe('Error Codes Enum', () => {
    test('should have all required error codes', () => {
        expect(ERROR_CODE).toHaveProperty('BAD_REQUEST');
        expect(ERROR_CODE).toHaveProperty('NOT_FOUND');
        expect(ERROR_CODE).toHaveProperty('UNAUTHORIZED');
        expect(ERROR_CODE).toHaveProperty('FORBIDDEN');
        expect(ERROR_CODE).toHaveProperty('INTERNAL');
    });

    test('should have correct error code values', () => {
        expect(ERROR_CODE.BAD_REQUEST).toBe('BAD_REQUEST');
        expect(ERROR_CODE.UNAUTHORIZED).toBe('UNAUTHORIZED');
        expect(ERROR_CODE.FORBIDDEN).toBe('FORBIDDEN');
    });

    test('error codes should be strings', () => {
        Object.values(ERROR_CODE).forEach(code => {
            expect(typeof code).toBe('string');
        });
    });

    test('should not have duplicate error codes', () => {
        const codes = Object.values(ERROR_CODE);
        const uniqueCodes = new Set(codes);
        expect(uniqueCodes.size).toBe(codes.length);
    });
});
