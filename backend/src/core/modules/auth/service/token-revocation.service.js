import { getRedisClient } from 'core/infrastructure/session.store';

const revokedAccessTokens = new Map();
const MAX_REVOKED_CACHE_SIZE = 5000;
const FALLBACK_TTL_MS = 24 * 60 * 60 * 1000;

const normalizeToken = token => token?.replace('Bearer ', '');

const getExpiresAt = payload => (payload?.exp ? payload.exp * 1000 : Date.now() + FALLBACK_TTL_MS);

const cleanupLocalStore = () => {
    const now = Date.now();
    for (const [token, expiresAt] of revokedAccessTokens.entries()) {
        if (expiresAt <= now) revokedAccessTokens.delete(token);
    }

    if (revokedAccessTokens.size <= MAX_REVOKED_CACHE_SIZE) return;
    const entries = [...revokedAccessTokens.entries()].sort((a, b) => a[1] - b[1]);
    const overflow = revokedAccessTokens.size - MAX_REVOKED_CACHE_SIZE;
    for (let i = 0; i < overflow; i += 1) {
        revokedAccessTokens.delete(entries[i][0]);
    }
};

export const TokenRevocationService = {
    async revoke(token, payload) {
        const rawToken = normalizeToken(token);
        if (!rawToken) return;

        const expiresAt = getExpiresAt(payload);
        const ttlMs = Math.max(1000, expiresAt - Date.now());

        if (process.env.REDIS_URL) {
            const client = await getRedisClient();
            await client.set(`revoked:access:${rawToken}`, '1', { PX: ttlMs });
            return;
        }

        revokedAccessTokens.set(rawToken, expiresAt);
        cleanupLocalStore();
    },

    async isRevoked(token) {
        const rawToken = normalizeToken(token);
        if (!rawToken) return false;

        if (process.env.REDIS_URL) {
            const client = await getRedisClient();
            return Boolean(await client.get(`revoked:access:${rawToken}`));
        }

        const expiresAt = revokedAccessTokens.get(rawToken);
        if (!expiresAt) return false;
        if (expiresAt <= Date.now()) {
            revokedAccessTokens.delete(rawToken);
            return false;
        }
        return true;
    },
};
