import { HumanMessage } from '@langchain/core/messages';
import { aiGraph } from '../../../ai/orchestrator/graph.js';
import { detectIntent } from '../../../ai/orchestrator/router.js';
import { transcribeAudio } from '../../../ai/agents/shared/stt.js';
import { SessionStore } from '../../infrastructure/session.store.js';
import { BadRequestException } from '../../../../packages/httpException';
import { SkillProfileRepository } from '../repositories/skill.profile.repository.js';

class AiServiceImpl {
    async _run(sessionId, text, stateOverride = {}) {
        let state = (await SessionStore.get(sessionId)) || {};

        if (!state.messages?.length) {
            // Redis expired — try to recover from MongoDB SkillProfile
            const saved = await SkillProfileRepository.findByUserId(sessionId).catch(() => null);

            const { nextStep } = await detectIntent(text);

            state = {
                messages: [],
                narrative_raw: saved?.narrative_raw || '',
                nextStep: saved ? 'match' : nextStep,   // skip intake if profile exists
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
}

export const AiService = new AiServiceImpl();
