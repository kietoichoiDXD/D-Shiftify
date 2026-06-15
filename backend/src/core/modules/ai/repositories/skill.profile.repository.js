import { SkillProfile } from '../models/skill.profile.model.js';
import { getRedisClient } from '../../../infrastructure/session.store.js';

export const SkillProfileRepository = {
  async upsert(userId, data) {
    if (process.env.MONGO_URL) {
      try {
        return await SkillProfile.findOneAndUpdate(
          { user_id: userId },
          { $set: data },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ).lean();
      } catch (err) {
        // Fallback to Redis on error
      }
    }
    const redis = await getRedisClient();
    const existingRaw = await redis.get(`ai_profile:${userId}`);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const updated = { ...existing, ...data, user_id: userId };
    await redis.set(`ai_profile:${userId}`, JSON.stringify(updated));
    await redis.sAdd('ai_profiles_set', String(userId));
    return updated;
  },

  async findByUserId(userId) {
    if (process.env.MONGO_URL) {
      try {
        const doc = await SkillProfile.findOne({ user_id: userId }).lean();
        if (doc) return doc;
      } catch (err) {
        // Fallback to Redis on error
      }
    }
    const redis = await getRedisClient();
    const raw = await redis.get(`ai_profile:${userId}`);
    return raw ? JSON.parse(raw) : null;
  },

  async getAllProfiles() {
    if (process.env.MONGO_URL) {
      try {
        return await SkillProfile.find(
          { narrative_embedding: { $exists: true, $ne: null } }
        ).lean();
      } catch (err) {
        // Fallback to Redis on error
      }
    }
    const redis = await getRedisClient();
    const userIds = await redis.sMembers('ai_profiles_set');
    const profiles = [];
    for (const userId of userIds) {
      const raw = await redis.get(`ai_profile:${userId}`);
      if (raw) {
        profiles.push(JSON.parse(raw));
      }
    }
    return profiles;
  },
};
