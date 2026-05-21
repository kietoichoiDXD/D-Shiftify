import { JobRepository } from '../repositories/job.repository.js';
import { analyzeSkillGap } from '../../../ai/agents/xai/skill_gap.js';
import { NotFoundException } from '../../../../packages/httpException';

/**
 * Fetch skill gap for a specific job given a candidate profile.
 * Used by GET /ai/jobs/:id/skill-gap
 *
 * @param {string} jobId
 * @param {object} profile  - candidate profile (hard_skills, soft_skills, inferred_skills)
 * @param {number} score    - pre-computed final_score (0-100), defaults to 0 to always show gap
 */
export const getSkillGapForJob = async (jobId, profile, score = 0) => {
    const job = await JobRepository.findById(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    return analyzeSkillGap(profile, job, score);
};
