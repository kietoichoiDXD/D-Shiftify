import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
  {
    user_id:   { type: String, required: true, index: true },
    job_id:    { type: String, required: true },
    job_title: { type: String },
    score:     { type: Number },
    read:      { type: Boolean, default: false },
  },
  { timestamps: true },
);

AlertSchema.index({ user_id: 1, job_id: 1 }, { unique: true });

export const AccessibilityAlert = mongoose.model('AccessibilityAlert', AlertSchema);
