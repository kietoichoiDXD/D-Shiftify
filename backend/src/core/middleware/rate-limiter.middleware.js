import rateLimit from 'express-rate-limit';
import { logger } from '../../packages/logger';

/**
 * Global rate limiter - General API endpoints
 * 15 requests per 15 minutes
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // limit each IP to 15 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: req.rateLimit.resetTime,
        });
    },
});

/**
 * Strict rate limiter - Authentication endpoints (login, register)
 * 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: false,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again later.',
            retryAfter: req.rateLimit.resetTime,
        });
    },
});

/**
 * File upload rate limiter
 * 10 requests per hour
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 requests per hour
    message: 'Too many file uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
            message: 'Too many file uploads. Please try again later.',
            retryAfter: req.rateLimit.resetTime,
        });
    },
});
