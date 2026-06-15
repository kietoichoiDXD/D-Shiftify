import { analystModel } from '../llm/gemini.client.js';
import { synthesizeSpeech } from '../utils/tts.js';
import { analyzeSkillGap } from './skill_gap.js';
import { sanitizeAbleist } from '../utils/ableist.js';

const GAP_THRESHOLD = parseInt(process.env.SKILL_GAP_THRESHOLD || '70', 10);
const MAX_XAI_JOBS = Math.min(parseInt(process.env.AI_MATCH_XAI_LIMIT || '3', 10), 5);

const computeProfileCoach = (profile, matches) => {
  if (!matches?.length) return null;
  const skillFreq = {};
  for (const m of matches)
    for (const s of (m.required_skills || []))
      skillFreq[s] = (skillFreq[s] || 0) + 1;

  const have = new Set([...(profile.hard_skills || []), ...(profile.soft_skills || []), ...(profile.inferred_skills || [])].map((s) => s.toLowerCase()));
  const avgJobSkills = matches.reduce((s, m) => s + (m.required_skills?.length || 1), 0) / matches.length;

  const missing = Object.entries(skillFreq)
    .filter(([s]) => !have.has(s.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([skill, freq]) => ({ skill, boost_estimate: Math.min(Math.round((0.40 / avgJobSkills) * freq * 100), 20), appears_in: freq }));

  if (!missing.length) return null;
  return {
    suggestions: missing,
    tts_text: missing.map((m) => `Thêm kỹ năng ${m.skill} có thể tăng điểm phù hợp của bạn thêm khoảng ${m.boost_estimate} điểm cho ${m.appears_in} việc làm.`).join(' '),
  };
};

const retrieveEvidence = (narrativeRaw, jobDescription, topN = 3) =>
  jobDescription.split(/[.!?]+/).filter((s) => s.trim().length > 20).slice(0, topN).join('. ');

const explainMatch = async (profile, job, narrativeRaw) => {
  const evidence = retrieveEvidence(narrativeRaw, job.description_raw || job.title);
  const res = await analystModel.invoke(
    `Dựa trên các đoạn sau từ mô tả công việc:\n"${evidence}"\n\n` +
    `Giải thích ngắn gọn (2 câu, đọc qua loa, ngôn ngữ thân thiện) tại sao ứng viên phù hợp.\n` +
    `Kết thúc: "Nói 'tiếp theo' để nghe việc làm kế tiếp."\n\n` +
    `Kỹ năng ứng viên: ${[...(profile.hard_skills || []), ...(profile.inferred_skills || [])].slice(0, 5).join(', ')}\n` +
    `Công việc: ${job.title}`,
  );
  return sanitizeAbleist(typeof res === 'string' ? res : res.content);
};

export const xaiNode = async (state) => {
  const { profile, matches, narrative_raw } = state;
  if (!matches?.length) return { nextStep: 'end' };

  try {
    const detailedMatches = matches.slice(0, MAX_XAI_JOBS);
    const untouchedMatches = matches.slice(MAX_XAI_JOBS);
    const enrichedDetailed = await Promise.all(
      detailedMatches.map(async (m) => {
        const [explanation, gap] = await Promise.all([
          explainMatch(profile, m, narrative_raw || ''),
          m.final_score < GAP_THRESHOLD ? analyzeSkillGap(profile, m) : Promise.resolve(null),
        ]);
        return { ...m, explanation, skill_gap: gap };
      }),
    );
    const enriched = [...enrichedDetailed, ...untouchedMatches];

    const ttsText = enriched
      .map((m, i) => `Việc ${i + 1}: ${m.title}. ${m.explanation}` + (m.skill_gap ? ` ${m.skill_gap.tts_text}` : ''))
      .join(' ');

    return {
      matches: enriched,
      tts_text: ttsText,
      audio_base64: await synthesizeSpeech(ttsText).catch(() => null),
      profile_coach: computeProfileCoach(profile, enriched),
      nextStep: 'end',
    };
  } catch (err) {
    return { errors: [err.message], error: err.message, nextStep: 'end' };
  }
};
