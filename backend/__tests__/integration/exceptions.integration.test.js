/**
 * Example Integration Test
 * 
 * Run: npm run test:integration
 */

import { HttpException } from '../src/packages/httpException/HttpException';
import { ForbiddenException } from '../src/packages/httpException/ForbiddenException';
import { BadRequestException } from '../src/packages/httpException/BadRequestException';
import { FORBIDDEN, BAD_REQUEST } from 'http-status';

describe('Exception Classes Integration', () => {
    describe('HttpException', () => {
        test('should create base HttpException', () => {
            const exception = new HttpException('Test error', 'TEST_CODE', 400);
            expect(exception.message).toBe('Test error');
            expect(exception.code).toBe('TEST_CODE');
            expect(exception.status).toBe(400);
        });

        test('should extend Error class', () => {
            const exception = new HttpException('Test', 'CODE', 400);
            expect(exception).toBeInstanceOf(Error);
        });
    });

    describe('ForbiddenException', () => {
        test('should create ForbiddenException with default message', () => {
            const exception = new ForbiddenException();
            expect(exception.message).toBe('You do not have permission to access this resource');
            expect(exception.status).toBe(FORBIDDEN);
        });

        test('should create ForbiddenException with custom message', () => {
            const customMsg = 'Custom forbidden message';
            const exception = new ForbiddenException(customMsg);
            expect(exception.message).toBe(customMsg);
            expect(exception.status).toBe(FORBIDDEN);
        });
    });

    describe('BadRequestException', () => {
        test('should create BadRequestException', () => {
            const exception = new BadRequestException('Invalid request');
            expect(exception.message).toBe('Invalid request');
            expect(exception.status).toBe(BAD_REQUEST);
        });
    });

    describe('Exception Hierarchy', () => {
        test('all exceptions should be instances of HttpException', () => {
            const forbidden = new ForbiddenException();
            const badRequest = new BadRequestException();
            
            expect(forbidden).toBeInstanceOf(HttpException);
            expect(badRequest).toBeInstanceOf(HttpException);
        });
    });
});
