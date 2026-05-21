import { z } from 'zod';
import { routerModel } from '../shared/llm.js';
import { extractEntities, detectATTools } from '../shared/nlp.js';
import { synthesizeSpeech } from '../shared/tts.js';

const W = { name: 0.15, hard_skills: 0.25, experience: 0.20, address_label: 0.15, accessibility_needs: 0.15, phone: 0.10 };

const completeness = (p) => Object.entries(W).reduce((s, [k, w]) => {
  const v = p[k];
  return s + (v && (!Array.isArray(v) || v.length) ? w : 0);
}, 0);

const QuestionSchema = z.object({
  next_question:   z.string(),
  narrative_chunk: z.string(),
});

const qModel = routerModel.withStructuredOutput(QuestionSchema);

export const intakeNode = async (state) => {
  const { messages, profile } = state;
  const userText = (() => { const m = messages[messages.length - 1]; return typeof m === 'string' ? m : m?.content || ''; })();

  const entities = await extractEntities(userText).catch(() => ({
    hard_skills: [], soft_skills: [], inferred_skills: [], experience: [], education: [], at_tools: [],
  }));

  const updated = {
    ...profile,
    hard_skills:         [...new Set([...(profile.hard_skills || []),        ...(entities.hard_skills || [])])],
    soft_skills:         [...new Set([...(profile.soft_skills || []),        ...(entities.soft_skills || [])])],
    inferred_skills:     [...new Set([...(profile.inferred_skills || []),    ...(entities.inferred_skills || [])])],
    experience:          [...(profile.experience || []),   ...(entities.experience || [])],
    education:           [...(profile.education || []),    ...(entities.education || [])],
    accessibility_needs: [...new Set([...(profile.accessibility_needs || []), ...(entities.at_tools || []), ...detectATTools(userText)])],
  };
  updated.profile_completeness = completeness(updated);

  const isComplete = updated.profile_completeness >= 0.6;
  const missing = Object.keys(W).filter((k) => { const v = updated[k]; return !v || (Array.isArray(v) && !v.length); });

  const { next_question, narrative_chunk } = await qModel.invoke(
    `Trợ lý tuyển dụng cho người khiếm thị.\n` +
    `QUAN TRỌNG: CHỈ trích xuất thông tin người dùng ĐÃ đề cập rõ ràng. KHÔNG suy diễn. KHÔNG thêm thông tin không có trong hội thoại. Nếu không chắc → để trống.\n\n` +
    `Hồ sơ hiện tại: ${JSON.stringify(updated)}.\n` +
    `Thiếu: ${missing.join(', ')}. Người dùng vừa nói: "${userText}".\n` +
    `${isComplete ? 'Hồ sơ đủ rồi, next_question = rỗng.' : 'Hỏi 1 câu ngắn về trường còn thiếu quan trọng nhất.'}`,
  ).catch(() => ({ next_question: '', narrative_chunk: userText }));

  const ttsText = next_question || 'Cảm ơn bạn! Đang tạo hồ sơ cho bạn.';

  return {
    profile: updated,
    narrative_raw: narrative_chunk || userText,
    messages: [{ role: 'assistant', content: ttsText }],
    tts_text: ttsText,
    audio_base64: await synthesizeSpeech(ttsText).catch(() => null),
    nextStep: isComplete ? 'resume' : 'intake',
  };
};
