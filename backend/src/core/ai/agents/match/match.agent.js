import { JobRepository } from '../../../modules/ai/repositories/job.repository.js';
import { hybridScore, inferWeights } from './match.scoring.js';
import { analystModel } from '../shared/llm.js';
import { synthesizeSpeech } from '../shared/tts.js';

const TOP_K  = parseInt(process.env.MATCH_TOP_K    || '3',  10);
const MIN_SCORE = parseInt(process.env.MATCH_MIN_SCORE || '40', 10);

const explainMatch = async (profile, job, weights) => {
  const dominant = Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0];
  const label = { skill: 'kỹ năng chuyên môn', exp: 'kinh nghiệm', at: 'hỗ trợ tiếp cận', geo: 'vị trí địa lý', culture_fit: 'văn hóa và phong cách làm việc' }[dominant] || 'hồ sơ';
  const res = await analystModel.invoke(
    `Giải thích ngắn gọn (2 câu, đọc qua loa, ngôn ngữ thân thiện) tại sao công việc phù hợp.\n` +
    `Nhấn mạnh yếu tố: ${label}. KHÔNG dùng số liệu kỹ thuật. Kết thúc: "Nói 'tiếp theo' để nghe việc làm kế tiếp."\n\n` +
    `Công việc: ${job.title}\n` +
    `Kỹ năng ứng viên: ${[...(profile.hard_skills || []), ...(profile.inferred_skills || [])].slice(0, 5).join(', ')}\n` +
    `Kỹ năng yêu cầu: ${(job.required_skills || []).slice(0, 5).join(', ')}`,
  );
  return typeof res === 'string' ? res : res.content;
};

export const matchNode = async (state) => {
  const { profile, narrative_embedding } = state;
  if (!narrative_embedding) return { errors: ['narrative_embedding missing'], nextStep: 'end' };

  try {
    const candidates = await JobRepository.vectorSearch(narrative_embedding, TOP_K * 5);

    const weightsMap = Object.fromEntries(
      await Promise.all(candidates.map(async (job) => [job.job_id, await inferWeights(job)])),
    );

    const scored = candidates
      .map((job) => ({ ...job, final_score: hybridScore(profile, job, parseFloat(job.semantic_score || 0), weightsMap[job.job_id]), weights: weightsMap[job.job_id] }))
      .filter((job) => job.final_score >= MIN_SCORE)
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, TOP_K);

    if (!scored.length) {
      const ttsText = 'Hiện tại chưa có việc làm phù hợp. Tôi sẽ thông báo khi có việc mới.';
      return { matches: [], tts_text: ttsText, audio_base64: await synthesizeSpeech(ttsText).catch(() => null), nextStep: 'end' };
    }

    const matches = await Promise.all(
      scored.map(async (job) => ({
        job_id: job.job_id, title: job.title, is_remote: job.is_remote,
        salary_min: job.salary_min, salary_max: job.salary_max,
        accessibility_level: job.accessibility_level, required_skills: job.required_skills,
        final_score: job.final_score, weights: job.weights,
        explanation: await explainMatch(profile, job, job.weights).catch(() => ''),
      })),
    );

    const ttsText =
      `Tôi tìm được ${matches.length} việc làm phù hợp. ` +
      matches.map((m, i) => `Việc ${i + 1}: ${m.title}, phù hợp ${m.final_score} phần trăm. ${m.explanation}`).join(' ');

    return { matches, tts_text: ttsText, audio_base64: await synthesizeSpeech(ttsText).catch(() => null), nextStep: 'xai' };
  } catch (err) {
    return { errors: [err.message], nextStep: 'end' };
  }
};
