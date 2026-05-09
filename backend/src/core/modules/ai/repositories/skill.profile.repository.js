import { SkillProfile } from '../models/skill.profile.model.js';

export const SkillProfileRepository = {
  async upsert(userId, data) {
    return SkillProfile.findOneAndUpdate(
      { user_id: userId },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
  },

  async findByUserId(userId) {
    return SkillProfile.findOne({ user_id: userId }).lean();
  },
};
