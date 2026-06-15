import { HumanMessage } from '@langchain/core/messages';
import { aiGraph } from '../../../ai/orchestrator/graph.js';
import { detectIntent } from '../../../ai/orchestrator/router.js';
import { transcribeAudio } from '../../../ai/agents/shared/stt.js';
import { SessionStore } from '../../../infrastructure/session.store.js';
import { BadRequestException } from '../../../../packages/httpException';
import { SkillProfileRepository } from '../repositories/skill.profile.repository.js';
import { JobRepository } from '../repositories/job.repository.js';
import { buildMatchExplanation, getJobWeights, hybridScore } from '../../../ai/agents/match/match.scoring.js';
import { logger } from '../../../../packages/logger/index.js';

const MAX_MATCH_RESULTS  = Number.parseInt(process.env.AI_MATCH_MAX_RESULTS    || '20',  10);
const MAX_MATCH_CANDIDATES = Number.parseInt(process.env.AI_MATCH_MAX_CANDIDATES || '60',  10);
const DESCRIPTION_CHARS  = Number.parseInt(process.env.AI_MATCH_DESCRIPTION_CHARS || '320', 10);

const GRAPH_TIMEOUT_MS = Number.parseInt(process.env.AI_GRAPH_TIMEOUT_MS || '120000', 10);

const toBoolean = (v) => v === true || v === 'true' || v === '1';
const clampInt  = (v, min, max, fallback) => { const n = Number.parseInt(v, 10); return Number.isNaN(n) ? fallback : Math.min(Math.max(n, min), max); };
const truncate  = (text = '', max = DESCRIPTION_CHARS) => text && text.length > max ? `${text.slice(0, max).trim()}...` : text;

const invokeGraph = (inputState, sessionId, extraConfig = {}) =>
    aiGraph.invoke(inputState, {
        configurable: { thread_id: String(sessionId || 'anonymous') },
        signal: AbortSignal.timeout(GRAPH_TIMEOUT_MS),
        ...extraConfig,
    });

const getGraphState = async (sessionId) => {
    try {
        return await aiGraph.getState({ configurable: { thread_id: String(sessionId) } });
    } catch {
        return null;
    }
};

class AiServiceImpl {

    async _isGraphAlive(sessionId) {
        const graphState = await getGraphState(sessionId);
        if (!graphState?.values) return false;
        const { nextStep } = graphState.values;
        return nextStep && nextStep !== 'end';
    }

    async _run(sessionId, text, stateOverride = {}) {
        const graphAlive = await this._isGraphAlive(sessionId);

        let inputState;

        if (graphAlive) {
            inputState = {
                messages: [new HumanMessage(text)],
                session_id: sessionId,
                ...stateOverride,
            };
        } else {
            await SessionStore.del(sessionId).catch(() => {});

            const saved      = await SkillProfileRepository.findByUserId(sessionId).catch(() => null);
            const { nextStep } = await detectIntent(text);

            inputState = {
                messages:           [new HumanMessage(text)],
                narrative_raw:      saved?.narrative_raw || '',
                nextStep:           saved ? 'match' : nextStep,
                session_id:         sessionId,
                profile: saved ? {
                    name: saved.name, phone: saved.phone,
                    address_label:   saved.address_label,
                    location_lat:    saved.location_lat,  location_lng: saved.location_lng,
                    hard_skills:     saved.hard_skills,   soft_skills:  saved.soft_skills,
                    inferred_skills: saved.inferred_skills,
                    experience:      saved.experience,    education:    saved.education,
                    accessibility_needs: saved.accessibility_needs,
                    profile_completeness: saved.profile_completeness,
                } : undefined,
                narrative_embedding: saved?.narrative_embedding || null,
                cv_data:             saved?.cv_data || null,
                errors:              [],
                ...stateOverride,
            };
        }

        const result = await invokeGraph(inputState, sessionId);

        await SessionStore.set(sessionId, result).catch(() => {});

        return result;
    }

    async chat(sessionId, text) {
        return this._run(sessionId, text);
    }

    async voiceChat(sessionId, audioBase64, encoding = 'audio/webm') {
        const text = await transcribeAudio(audioBase64, encoding);
        if (!text) throw new BadRequestException('Could not transcribe audio');
        return this._run(sessionId, text);
    }

    async auditJD(jdText) {
        const ephemeralId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        return invokeGraph(
            { messages: [new HumanMessage(jdText)], nextStep: 'hr', narrative_raw: '', session_id: null, errors: [] },
            ephemeralId,
        );
    }

    async clearSession(sessionId) {
        await SessionStore.del(sessionId).catch(() => {});
        try {
            const state = await getGraphState(sessionId);
            if (state) {
                logger.info(`[AiService] clearSession: ${sessionId} — LangGraph checkpoint will be orphaned (MemorySaver has no delete API)`);
            }
        } catch { /* ignore */ }
    }

    async recommendJobs(profileId, { limit = 10, minScore = 0, explain = false, includeDescription = true } = {}) {
        const profile = await SkillProfileRepository.findByUserId(profileId);
        if (!profile) throw new BadRequestException('Candidate AI profile not found');

        const resultLimit     = clampInt(limit,    1,  MAX_MATCH_RESULTS,   10);
        const minimumScore    = clampInt(minScore,  0,  100,                  0);
        const candidateLimit  = Math.min(Math.max(resultLimit * 4, 20), MAX_MATCH_CANDIDATES);

        const candidates = profile.narrative_embedding
            ? await JobRepository.vectorSearch(profile.narrative_embedding, candidateLimit)
            : await JobRepository.listAccessible(candidateLimit);

        const scored = candidates.map(job => {
            const weights    = getJobWeights(job);
            const finalScore = hybridScore(profile, job, parseFloat(job.semantic_score || 0), weights);
            const match = {
                jobId:             job.job_id,
                title:             job.title,
                description:       toBoolean(includeDescription) ? truncate(job.description_raw) : undefined,
                requiredSkills:    job.required_skills || [],
                salaryMin:         job.salary_min,
                salaryMax:         job.salary_max,
                isRemote:          job.is_remote,
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
