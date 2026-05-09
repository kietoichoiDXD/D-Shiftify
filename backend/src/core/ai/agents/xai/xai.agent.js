import { analystModel } from '../shared/llm.js';
import { synthesizeSpeech } from '../shared/tts.js';
import { analyzeSkillGap } from './skill_gap.js';
import { sanitizeAbleist } from '../shared/ableist.js';

const GAP_THRESHOLD = parseInt(process.env.SKILL_GAP_THRESHOLD || '70', 10);

/**
 * Profile Coach: find which missing skills would boost score the most.
 * Returns top-2 skills with estimated score delta.
 */
const computeProfileCoach = (profile, matches) => {
  if (!matches?.length) return null;

  // Collect all required skills across top matches
  const skillFreq = {};
  for (const m of matches) {
    for (const s of (m.required_skills || [])) {
      skillFreq[s] = (skillFreq[s] || 0) + 1;
    }
  }

  const allCandidateSkills = new Set([
    ...(profile.hard_skills || []),
    ...(profile.soft_skills || []),
    ...(profile.inferred_skills || []),
  ].map((s) => s.toLowerCase()));

  // Missing skills sorted by frequency across top jobs
  const missing = Object.entries(skillFreq)
    .filter(([s]) => !allCandidateSkills.has(s.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([skill, freq]) => {
      // Estimate score boost: adding skill increases skill_score by 1/job_skills_count
      const avgJobSkills = matches.reduce((s, m) => s + (m.required_skills?.length || 1), 0) / matches.length;
      const boost = Math.round((0.40 / avgJobSkills) * freq * 100);
      return { skill, boost_estimate: Math.min(boost, 20), appears_in: freq };
    });

  if (!missing.length) return null;

  const tts_text = missing
    .map((m) => `Thêm kỹ năng ${m.skill} có thể tăng điểm phù hợp của bạn thêm khoảng ${m.boost_estimate} điểm cho ${m.appears_in} việc làm.`)
    .join(' ');

  return { suggestions: missing, tts_text };
};

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
  return sanitizeAbleist(typeof res === 'string' ? res : res.content);
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
          m.final_score < GAP_THRESHOLD ? analyzeSkillGap(profile, m) : Promise.resolve(null),
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

    const profile_coach = computeProfileCoach(profile, enriched);

    return { matches: enriched, tts_text: ttsText, audio_base64: audio, profile_coach, nextStep: 'end' };
  } catch (err) {
    return { errors: [err.message], nextStep: 'end' };
  }
};
