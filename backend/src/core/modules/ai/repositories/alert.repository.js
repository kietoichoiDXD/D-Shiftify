import { AccessibilityAlert } from '../models/alert.model.js';
import { getRedisClient } from '../../../infrastructure/session.store.js';

export const AlertRepository = {
  async saveAlerts(alerts) {
    if (process.env.MONGO_URL) {
      try {
        await AccessibilityAlert.insertMany(alerts, { ordered: false });
        return;
      } catch (err) {
        // Fallback to Redis
      }
    }
    const redis = await getRedisClient();
    for (const alert of alerts) {
      const key = `alerts:${alert.user_id}`;
      const existingRaw = await redis.get(key);
      const list = existingRaw ? JSON.parse(existingRaw) : [];
      // Prevent duplicates
      if (!list.some(a => a.job_id === alert.job_id)) {
        list.push({ ...alert, read: false, createdAt: new Date() });
        await redis.set(key, JSON.stringify(list));
      }
    }
  },

  async findUnreadByUserId(userId) {
    if (process.env.MONGO_URL) {
      try {
        return await AccessibilityAlert.find({ user_id: userId, read: false })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();
      } catch (err) {
        // Fallback to Redis
      }
    }
    const redis = await getRedisClient();
    const key = `alerts:${userId}`;
    const raw = await redis.get(key);
    const list = raw ? JSON.parse(raw) : [];
    return list.filter(a => !a.read).slice(0, 20);
  },

  async markAllRead(userId) {
    if (process.env.MONGO_URL) {
      try {
        await AccessibilityAlert.updateMany({ user_id: userId, read: false }, { $set: { read: true } });
        return;
      } catch (err) {
        // Fallback to Redis
      }
    }
    const redis = await getRedisClient();
    const key = `alerts:${userId}`;
    const raw = await redis.get(key);
    if (raw) {
      const list = JSON.parse(raw);
      list.forEach(a => { a.read = true; });
      await redis.set(key, JSON.stringify(list));
    }
  }
};
