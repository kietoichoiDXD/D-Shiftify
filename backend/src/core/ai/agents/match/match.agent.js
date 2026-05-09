import { JobRepository } from '../../../modules/ai/repositories/job.repository.js';
import { hybridScore } from './match.scoring.js';
import { analystModel } from '../shared/llm.js';
import { synthesizeSpeech } from '../shared/tts.js';

const TOP_K_VOICE = parseInt(process.env.MATCH_TOP_K || '3', 10);

const explainMatch = async (profile, job, score) => {
  const res = await analystModel.invoke(
    `Giải thích ngắn gọn (tối đa 2 câu, ngôn ngữ đơn giản, phù hợp đọc qua loa) ` +
    `tại sao công việc này phù hợp với ứng viên. ` +
    `KHÔNG dùng số liệu kỹ thuật. Kết thúc: "Nói 'tiếp theo' để nghe việc làm kế tiếp."\n\n` +
    `Công việc: ${job.title}\n` +
    `Điểm phù hợp: ${score} phần trăm\n` +
    `Kỹ năng ứng viên: ${[...(profile.hard_skills || []), ...(profile.inferred_skills || [])].slice(0, 5).join(', ')}\n` +
    `Kỹ năng yêu cầu: ${(job.required_skills || []).slice(0, 5).join(', ')}`,
  );
  return typeof res === 'string' ? res : res.content;
};

export const matchNode = async (state) => {
  const { profile, narrative_embedding } = state;

  if (!narrative_embedding) {
    return { errors: ['narrative_embedding missing — run resume node first'], nextStep: 'end' };
  }

  try {
    // 1. pgvector search via JobRepository (filters out level 'A' jobs)
    const candidates = await JobRepository.vectorSearch(narrative_embedding, TOP_K_VOICE * 5);

    // 2. Hybrid scoring
    const scored = candidates
      .map((job) => ({
        ...job,
        final_score: hybridScore(profile, job, parseFloat(job.semantic_score)),
      }))
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, TOP_K_VOICE);

    // 3. Explanations in parallel
    const matches = await Promise.all(
      scored.map(async (job) => ({
        job_id: job.job_id,
        title: job.title,
        is_remote: job.is_remote,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        accessibility_level: job.accessibility_level,
        final_score: job.final_score,
        explanation: await explainMatch(profile, job, job.final_score).catch(() => ''),
      })),
    );

    // 4. TTS summary
    const ttsText = matches.length
      ? `Tôi tìm được ${matches.length} việc làm phù hợp. ` +
        matches.map((m, i) =>
          `Việc ${i + 1}: ${m.title}, phù hợp ${m.final_score} phần trăm. ${m.explanation}`,
        ).join(' ')
      : 'Hiện tại chưa có việc làm phù hợp. Tôi sẽ thông báo khi có việc mới.';

    const audio = await synthesizeSpeech(ttsText).catch(() => null);

    return { matches, tts_text: ttsText, audio_base64: audio, nextStep: 'xai' };
  } catch (err) {
    return { errors: [err.message], nextStep: 'end' };
  }
};
