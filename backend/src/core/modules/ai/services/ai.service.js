import { HumanMessage } from '@langchain/core/messages';
import { aiGraph } from '../../ai/orchestrator/graph.js';
import { detectIntent } from '../../ai/orchestrator/router.js';
import { transcribeAudio } from '../../ai/agents/shared/stt.js';
import { SessionStore } from '../../infrastructure/session.store.js';

class AiServiceImpl {
  async _run(sessionId, text, stateOverride = {}) {
    let state = (await SessionStore.get(sessionId)) || {};

    if (!state.messages?.length) {
      const { nextStep } = await detectIntent(text);
      state = { messages: [], narrative_raw: '', nextStep, session_id: sessionId, ...stateOverride };
    }

    // Ensure session_id is always in state
    state.session_id = sessionId;
    state.messages = [...(state.messages || []), new HumanMessage(text)];

    const result = await aiGraph.invoke(state);
    await SessionStore.set(sessionId, result);
    return result;
  }

  async chat(sessionId, text) {
    return this._run(sessionId, text);
  }

  async voiceChat(sessionId, audioBase64, encoding = 'audio/webm') {
    const text = await transcribeAudio(audioBase64, encoding);
    if (!text) throw new Error('Could not transcribe audio');
    return this._run(sessionId, text);
  }

  async auditJD(jdText) {
    return aiGraph.invoke({
      messages: [new HumanMessage(jdText)],
      nextStep: 'hr',
      narrative_raw: '',
      session_id: null,
    });
  }

  async clearSession(sessionId) {
    await SessionStore.del(sessionId);
  }
}

export const AiService = new AiServiceImpl();
