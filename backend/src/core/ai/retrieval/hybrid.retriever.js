import { JobRepository } from '../../modules/ai/repositories/job.repository.js';
import db from '../../database/index.js';
import { logger } from '../../../packages/logger/index.js';

/**
 * Hybrid Retriever: Dense Vector Search + Sparse SQL Filter and Keyword boost
 */
export const retrieveHybrid = async (queryVec, profile, limit = 10) => {
  logger.info(`[Retrieval] Initiating Hybrid Retrieval for profile`);
  
  // 1. Fetch candidates from pgvector semantic search
  const candidates = await JobRepository.vectorSearch(queryVec, limit * 3);
  if (!candidates || !candidates.length) {
    return [];
  }

  // 2. Perform metadata and keyword filter / boost
  const userHardSkills = (profile.hard_skills || []).map(s => s.toLowerCase());
  const userSoftSkills = (profile.soft_skills || []).map(s => s.toLowerCase());
  const userAccessibilityNeeds = (profile.accessibility_needs || []).map(s => s.toLowerCase());
  
  const scoredCandidates = candidates.map(job => {
    let keywordBoost = 0;
    
    // Check for hard skill keyword overlap
    const jobSkills = (job.required_skills || []).map(s => s.toLowerCase());
    const matchedSkills = jobSkills.filter(s => userHardSkills.includes(s) || userSoftSkills.includes(s));
    if (jobSkills.length > 0) {
      keywordBoost += (matchedSkills.length / jobSkills.length) * 0.2; // up to 20% boost
    }

    // Check remote match
    let remoteMatch = 0;
    if (profile.preferences?.remote === job.is_remote) {
      remoteMatch = 0.1; // 10% remote boost
    }

    // Combine vector score and keyword/meta boosts
    const vectorScore = parseFloat(job.semantic_score || 0);
    const combinedScore = (vectorScore * 0.7) + ((keywordBoost + remoteMatch) * 0.3);

    return {
      ...job,
      hybrid_score: Math.min(Math.max(combinedScore, 0), 1),
    };
  });

  // Sort by hybrid score
  return scoredCandidates.sort((a, b) => b.hybrid_score - a.hybrid_score).slice(0, limit);
};
