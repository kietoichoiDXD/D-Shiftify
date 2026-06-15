import { createClient } from 'redis';
import { logger } from '../../packages/logger/index.js';

const TTL = parseInt(process.env.SESSION_TTL || '1800', 10); // 30 min

const _memStore = new Map();
const _memTtl   = new Map();

const memGet = (key) => {
  const exp = _memTtl.get(key);
  if (exp && Date.now() > exp) { _memStore.delete(key); _memTtl.delete(key); return null; }
  return _memStore.get(key) ?? null;
};
const memSet = (key, value, ttlSec) => {
  _memStore.set(key, value);
  _memTtl.set(key, Date.now() + ttlSec * 1000);
};
const memDel = (key) => { _memStore.delete(key); _memTtl.delete(key); };

let _client    = null;
let _useMemory = false; // set true once Redis fails to connect

export const getRedisClient = async () => {
  if (_client)    return _client;
  if (_useMemory) return null;

  try {
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', (err) => logger.warn('[SessionStore] Redis error — switching to in-memory', { err: err.message }));
    await client.connect();
    _client = client;
    logger.info('[SessionStore] Redis connected');
    return _client;
  } catch (err) {
    logger.warn('[SessionStore] Redis unavailable — using in-memory session store', { err: err.message });
    _useMemory = true;
    return null;
  }
};

/**
 * Persist LangGraph AgentState between voice turns.
 * Strips audio_base64 before saving (too large for storage).
 * Falls back to an in-process Map when Redis is not available.
 */
export const SessionStore = {
  async get(sessionId) {
    const client = await getRedisClient();
    if (!client) return memGet(`session:${sessionId}`);
    const raw = await client.get(`session:${sessionId}`).catch(() => null);
    return raw ? JSON.parse(raw) : null;
  },

  async set(sessionId, state) {
    const client = await getRedisClient();
    const { audio_base64, ...rest } = state; // strip binary blob
    if (!client) { memSet(`session:${sessionId}`, rest, TTL); return; }
    await client.setEx(`session:${sessionId}`, TTL, JSON.stringify(rest)).catch(() => {
      memSet(`session:${sessionId}`, rest, TTL);
    });
  },

  async del(sessionId) {
    const client = await getRedisClient();
    if (!client) { memDel(`session:${sessionId}`); return; }
    await client.del(`session:${sessionId}`).catch(() => memDel(`session:${sessionId}`));
  },
};
