import { analystModel } from '../shared/llm.js';
import { synthesizeSpeech } from '../shared/tts.js';
import { analyzeSkillGap } from './skill_gap.js';

const GAP_THRESHOLD = parseInt(process.env.SKILL_GAP_THRESHOLD || '70', 10);

// ── RAG: retrieve top evidence chunks from job description ────────────────────
const retrieveEvidence = (narrativeRaw, jobDescription, topN = 3) => {
  // Simple sentence-level retrieval (no vector needed — Gemini handles semantic)
  const sentences = jobDescription.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  // Return first topN sentences as context (Gemini will rank relevance in prompt)
  return sentences.slice(0, topN).join('. ');
};

// ── RAG explanation per match ─────────────────────────────────────────────────
const explainMatch = async (profile, job, score, narrativeRaw) => {
  const evidence = retrieveEvidence(narrativeRaw, job.description_raw || job.title);

  const res = await analystModel.invoke(
    `Dựa trên các đoạn sau từ mô tả công việc:\n"${evidence}"\n\n` +
    `Giải thích ngắn gọn (2 câu, đọc qua loa, ngôn ngữ thân thiện) tại sao ứng viên phù hợp.\n` +
    `Ví dụ: "Kinh nghiệm [X] của bạn rất giá trị cho yêu cầu [Y] của công việc này."\n` +
    `Kết thúc: "Nói 'tiếp theo' để nghe việc làm kế tiếp."\n\n` +
    `Kỹ năng ứng viên: ${[...(profile.hard_skills || []), ...(profile.inferred_skills || [])].slice(0, 5).join(', ')}\n` +
    `Công việc: ${job.title}`,
  );
  return typeof res === 'string' ? res : res.content;
};

// ── XAI Node ──────────────────────────────────────────────────────────────────
export const xaiNode = async (state) => {
  const { profile, matches, narrative_raw } = state;
  if (!matches?.length) return { nextStep: 'end' };

  try {
    // Enrich each match with RAG explanation + skill gap
    const enriched = await Promise.all(
      matches.map(async (m) => {
        const [explanation, gap] = await Promise.all([
          explainMatch(profile, m, m.final_score, narrative_raw || ''),
          m.final_score < GAP_THRESHOLD ? analyzeSkillGap(profile, m, m.final_score) : Promise.resolve(null),
        ]);
        return { ...m, explanation, skill_gap: gap };
      }),
    );

    // Build TTS output
    const ttsText = enriched
      .map((m, i) =>
        `Việc ${i + 1}: ${m.title}. ${m.explanation}` +
        (m.skill_gap ? ` ${m.skill_gap.tts_text}` : ''),
      )
      .join(' ');

    const audio = await synthesizeSpeech(ttsText).catch(() => null);

    return { matches: enriched, tts_text: ttsText, audio_base64: audio, nextStep: 'end' };
  } catch (err) {
    return { errors: [err.message], nextStep: 'end' };
  }
};
