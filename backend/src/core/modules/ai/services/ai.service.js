import { HumanMessage } from '@langchain/core/messages';
import { aiGraph } from '../../../ai/orchestrator/graph.js';
import { detectIntent } from '../../../ai/orchestrator/router.js';
import { transcribeAudio } from '../../../ai/agents/shared/stt.js';
import { SessionStore } from '../../infrastructure/session.store.js';
import { BadRequestException } from '../../../../packages/httpException';
import { SkillProfileRepository } from '../repositories/skill.profile.repository.js';
import { JobRepository } from '../repositories/job.repository.js';
import { buildMatchExplanation, getJobWeights, hybridScore } from '../../../ai/agents/match/match.scoring.js';

const MAX_MATCH_RESULTS = Number.parseInt(process.env.AI_MATCH_MAX_RESULTS || '20', 10);
const MAX_MATCH_CANDIDATES = Number.parseInt(process.env.AI_MATCH_MAX_CANDIDATES || '60', 10);
const DESCRIPTION_CHARS = Number.parseInt(process.env.AI_MATCH_DESCRIPTION_CHARS || '320', 10);

const toBoolean = value => value === true || value === 'true' || value === '1';
const clampInt = (value, min, max, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

const truncate = (text = '', max = DESCRIPTION_CHARS) =>
    text && text.length > max ? `${text.slice(0, max).trim()}...` : text;

class AiServiceImpl {
    async _run(sessionId, text, stateOverride = {}) {
        let state = (await SessionStore.get(sessionId)) || {};

        if (!state.messages?.length) {
            const saved = await SkillProfileRepository.findByUserId(sessionId).catch(() => null);

            const { nextStep } = await detectIntent(text);

            state = {
                messages: [],
                narrative_raw: saved?.narrative_raw || '',
                nextStep: saved ? 'match' : nextStep,
                session_id: sessionId,
                profile: saved ? {
                    name: saved.name, phone: saved.phone,
                    address_label: saved.address_label,
                    location_lat: saved.location_lat, location_lng: saved.location_lng,
                    hard_skills: saved.hard_skills, soft_skills: saved.soft_skills,
                    inferred_skills: saved.inferred_skills, experience: saved.experience,
                    education: saved.education, accessibility_needs: saved.accessibility_needs,
                    profile_completeness: saved.profile_completeness,
                } : undefined,
                narrative_embedding: saved?.narrative_embedding || null,
                cv_data: saved?.cv_data || null,
                ...stateOverride,
            };
        }

        state.session_id = sessionId;
        state.messages = [...(state.messages || []), new HumanMessage(text)];

        const result = await aiGraph.invoke(state);
        await SessionStore.set(sessionId, result);
        return result;
    }

    async chat(sessionId, text) { return this._run(sessionId, text); }

    async voiceChat(sessionId, audioBase64, encoding = 'audio/webm') {
        const text = await transcribeAudio(audioBase64, encoding);
        if (!text) throw new BadRequestException('Could not transcribe audio');
        return this._run(sessionId, text);
    }

    async auditJD(jdText) {
        return aiGraph.invoke({ messages: [new HumanMessage(jdText)], nextStep: 'hr', narrative_raw: '', session_id: null });
    }

    async clearSession(sessionId) { await SessionStore.del(sessionId); }

    async recommendJobs(profileId, { limit = 10, minScore = 0, explain = false, includeDescription = true } = {}) {
        const profile = await SkillProfileRepository.findByUserId(profileId);
        if (!profile) {
            throw new BadRequestException('Candidate AI profile not found');
        }

        const resultLimit = clampInt(limit, 1, MAX_MATCH_RESULTS, 10);
        const minimumScore = clampInt(minScore, 0, 100, 0);
        const candidateLimit = Math.min(Math.max(resultLimit * 4, 20), MAX_MATCH_CANDIDATES);
        const candidates = profile.narrative_embedding
            ? await JobRepository.vectorSearch(profile.narrative_embedding, candidateLimit)
            : await JobRepository.listAccessible(candidateLimit);

        const scored = candidates.map(job => {
            const weights = getJobWeights(job);
            const finalScore = hybridScore(profile, job, parseFloat(job.semantic_score || 0), weights);
            const match = {
                jobId: job.job_id,
                title: job.title,
                description: toBoolean(includeDescription) ? truncate(job.description_raw) : undefined,
                requiredSkills: job.required_skills || [],
                salaryMin: job.salary_min,
                salaryMax: job.salary_max,
                isRemote: job.is_remote,
                accessibilityLevel: job.accessibility_level,
                accessibilityScore: job.accessibility_score,
                finalScore,
                weights,
                semanticScore: parseFloat(job.semantic_score || 0),
            };
            if (toBoolean(explain)) {
                match.explanation = buildMatchExplanation(profile, job, weights, finalScore);
            }
            return match;
        });

        return scored
            .filter(job => job.finalScore >= minimumScore)
            .sort((a, b) => b.finalScore - a.finalScore)
            .slice(0, resultLimit);
    }
}

export const AiService = new AiServiceImpl();
