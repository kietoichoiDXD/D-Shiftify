import { createClient } from 'redis';
import { logger } from '../../../packages/logger/index.js';

const TTL = parseInt(process.env.SESSION_TTL || '1800', 10); // 30 min

let _client = null;

export const getRedisClient = async () => {
  if (_client) return _client;
  _client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  _client.on('error', (err) => logger.error('Redis error', { err: err.message }));
  await _client.connect();
  return _client;
};

/**
 * Persist LangGraph AgentState between voice turns.
 * Strips audio_base64 before saving (too large, not needed).
 */
export const SessionStore = {
  async get(sessionId) {
    const client = await getRedisClient();
    const raw = await client.get(`session:${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  },

  async set(sessionId, state) {
    const client = await getRedisClient();
    const { audio_base64, ...rest } = state; // strip binary
    await client.setEx(`session:${sessionId}`, TTL, JSON.stringify(rest));
  },

  async del(sessionId) {
    const client = await getRedisClient();
    await client.del(`session:${sessionId}`);
  },
};
