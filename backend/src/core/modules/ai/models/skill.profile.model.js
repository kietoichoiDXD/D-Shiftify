import mongoose from 'mongoose';

const SkillProfileSchema = new mongoose.Schema(
  {
    user_id:     { type: String, required: true, unique: true, index: true },
    name:        { type: String, default: '' },
    phone:       { type: String, default: '' },
    address_label: { type: String, default: '' },
    location_lat:  { type: Number, default: null },
    location_lng:  { type: Number, default: null },

    hard_skills:      [String],
    soft_skills:      [String],
    inferred_skills:  [String],

    experience: [{
      title: String, company: String, duration: String, description: String,
    }],
    education: [{
      degree: String, institution: String, year: String,
    }],

    accessibility_needs: [String], // ['screen_reader','voice_control',...]

    narrative_raw:       { type: String, default: '' },
    narrative_embedding: { type: [Number], default: null }, // 768-dim vector

    cv_data:             { type: mongoose.Schema.Types.Mixed, default: null },
    profile_completeness: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const SkillProfile = mongoose.model('SkillProfile', SkillProfileSchema);
