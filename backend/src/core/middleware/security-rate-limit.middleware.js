import { getRedisClient } from '../infrastructure/session.store';
import { TRUST_PROXY } from '../env';

const TOO_MANY_REQUESTS = 429;

const WINDOWS = [
    {
        name: 'auth-sensitive',
        methods: ['POST'],
        paths: ['/api/auth/', '/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/refresh-token', '/api/users/'],
        windowMs: 60 * 1000,
        max: 10,
    },
    {
        name: 'ai-expensive',
        methods: ['POST', 'GET'],
        paths: ['/api/ai/chat', '/api/ai/voice', '/api/ai/voice/stream', '/api/ai/audit-jd', '/api/ai/jobs'],
        windowMs: 60 * 1000,
        max: 30,
    },
];

const buckets = new Map();
const MAX_BUCKETS = 10000;
let lastCleanupAt = 0;

const cleanupBuckets = now => {
    if (now - lastCleanupAt < 60 * 1000 && buckets.size <= MAX_BUCKETS) return;
    lastCleanupAt = now;

    for (const [key, value] of buckets.entries()) {
        if (value.resetAt <= now) buckets.delete(key);
    }

    if (buckets.size <= MAX_BUCKETS) return;
    const overflow = buckets.size - MAX_BUCKETS;
    const keys = buckets.keys();
    for (let i = 0; i < overflow; i += 1) {
        const next = keys.next();
        if (next.done) break;
        buckets.delete(next.value);
    }
};

const clientKey = req => {
    const forwardedFor = TRUST_PROXY ? req.headers['x-forwarded-for'] : null;
    const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : (forwardedFor || req.ip || req.connection?.remoteAddress || 'unknown').split(',')[0].trim();
    return `${ip}:${req.method}:${req.originalUrl.split('?')[0]}`;
};

const findWindow = req => WINDOWS.find(rule => (
    rule.methods.includes(req.method)
    && rule.paths.some(path => req.originalUrl.startsWith(path))
));

export const SecurityRateLimitMiddleware = (req, res, next) => {
    const rule = findWindow(req);
    if (!rule) return next();

    const now = Date.now();
    const key = `${rule.name}:${clientKey(req)}`;

    if (process.env.REDIS_URL) {
        return getRedisClient()
            .then(async client => {
                const redisKey = `rate-limit:${key}`;
                const count = await client.incr(redisKey);
                if (count === 1) await client.pExpire(redisKey, rule.windowMs);

                if (count > rule.max) {
                    const ttl = await client.pTTL(redisKey);
                    return rejectRequest(res, Math.max(1, Math.ceil(ttl / 1000)));
                }

                return next();
            })
            .catch(() => applyLocalLimit(rule, key, now, res, next));
    }

    return applyLocalLimit(rule, key, now, res, next);
};

const applyLocalLimit = (rule, key, now, res, next) => {
    cleanupBuckets(now);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
        return next();
    }

    current.count += 1;
    if (current.count > rule.max) {
        return rejectRequest(res, Math.ceil((current.resetAt - now) / 1000));
    }

    return next();
};

const rejectRequest = (res, retryAfterSeconds) => {
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(TOO_MANY_REQUESTS).json({
        status: TOO_MANY_REQUESTS,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
    });
};
