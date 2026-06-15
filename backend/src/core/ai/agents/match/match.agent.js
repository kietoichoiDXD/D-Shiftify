import { JobRepository } from '../../../modules/ai/repositories/job.repository.js';
import { buildMatchExplanation, getJobWeights, hybridScore } from './match.scoring.js';
import { synthesizeSpeech } from '../shared/tts.js';

const TOP_K = Math.min(parseInt(process.env.MATCH_TOP_K || '3', 10), 10);
const MIN_SCORE = parseInt(process.env.MATCH_MIN_SCORE || '40', 10);
const MAX_CANDIDATES = parseInt(process.env.AI_MATCH_MAX_CANDIDATES || '60', 10);
const USE_LLM_XAI = process.env.AI_MATCH_USE_LLM_EXPLANATIONS === 'true';

export const matchNode = async state => {
  const { profile, narrative_embedding } = state;
  if (!narrative_embedding) return { errors: ['narrative_embedding missing'], nextStep: 'end' };

  try {
    const candidateLimit = Math.min(Math.max(TOP_K * 8, 20), MAX_CANDIDATES);
    const candidates = await JobRepository.vectorSearch(narrative_embedding, candidateLimit);

    const scored = candidates
      .map(job => {
        const weights = getJobWeights(job);
        const finalScore = hybridScore(profile, job, parseFloat(job.semantic_score || 0), weights);
        return {
          ...job,
          final_score: finalScore,
          weights,
          explanation: buildMatchExplanation(profile, job, weights, finalScore),
        };
      })
      .filter(job => job.final_score >= MIN_SCORE)
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, TOP_K);

    if (!scored.length) {
      const ttsText = 'Hien tai chua co viec lam phu hop. Toi se thong bao khi co viec moi.';
      return {
        matches: [],
        tts_text: ttsText,
        audio_base64: await synthesizeSpeech(ttsText).catch(() => null),
        nextStep: 'end',
      };
    }

    const matches = scored.map(job => ({
      job_id: job.job_id,
      title: job.title,
      is_remote: job.is_remote,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      accessibility_level: job.accessibility_level,
      required_skills: job.required_skills,
      final_score: job.final_score,
      weights: job.weights,
      explanation: job.explanation,
    }));

    const ttsText =
      `Toi tim duoc ${matches.length} viec lam phu hop. ` +
      matches.map((match, index) => `Viec ${index + 1}: ${match.title}, phu hop ${match.final_score} phan tram.`).join(' ');

    return {
      matches,
      tts_text: ttsText,
      audio_base64: await synthesizeSpeech(ttsText).catch(() => null),
      nextStep: USE_LLM_XAI ? 'xai' : 'end',
    };
  } catch (err) {
    return { errors: [err.message], error: err.message, nextStep: 'end' };
  }
};
