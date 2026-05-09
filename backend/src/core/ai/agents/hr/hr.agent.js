import { z } from 'zod';
import { analystModel } from '../shared/llm.js';
import { synthesizeSpeech } from '../shared/tts.js';

// ── Ableist language patterns ─────────────────────────────────────────────────
const ABLEIST = [
  { pattern: /nhìn thấy vấn đề/gi,  suggestion: 'nhận ra vấn đề' },
  { pattern: /nhanh nhẹn/gi,         suggestion: 'linh hoạt' },
  { pattern: /năng động/gi,          suggestion: 'chủ động, nhiệt tình' },
  { pattern: /quan sát trực tiếp/gi, suggestion: 'theo dõi, giám sát' },
  { pattern: /đẹp mắt/gi,            suggestion: 'chuyên nghiệp, rõ ràng' },
  { pattern: /bình thường/gi,        suggestion: 'không có yêu cầu đặc biệt' },
];

const detectAbleist = (text) =>
  ABLEIST
    .filter(({ pattern }) => pattern.test(text))
    .map(({ pattern, suggestion }) => ({
      original: pattern.source.replace(/\\/g, ''),
      suggestion,
    }));

// ── HR Schema ─────────────────────────────────────────────────────────────────
const HRSchema = z.object({
  score:        z.number().min(0).max(100),
  issues:       z.array(z.string()),
  suggestions:  z.array(z.string()),
  rewritten_jd: z.string(),
  audio_summary: z.string().describe('2-3 câu tóm tắt cho ứng viên nghe, không ký tự đặc biệt'),
});

const hrModel = analystModel.withStructuredOutput(HRSchema);

const scoreToLevel = (s) => s >= 80 ? 'AAA' : s >= 50 ? 'AA' : 'A';

export const hrNode = async (state) => {
  const jdText = state.messages[state.messages.length - 1]?.content || '';

  // 1. Detect ableist language (fast, no LLM)
  const ableistFound = detectAbleist(jdText);

  // 2. Full accessibility audit + rewrite
  const result = await hrModel.invoke(
    `Bạn là chuyên gia inclusive hiring và WCAG 2.2.\n` +
    `Đánh giá JD (0-100) về mức độ thân thiện với người khiếm thị:\n\n"${jdText}"\n\n` +
    `Tiêu chí: ngôn ngữ rõ ràng (20đ), không yêu cầu thị giác không cần thiết (25đ), ` +
    `đề cập hỗ trợ accessibility (25đ), không bias vô thức (15đ), mô tả môi trường rõ (15đ).\n` +
    `Ngôn từ ableist đã phát hiện: ${ableistFound.map((a) => a.original).join(', ') || 'không có'}.\n` +
    `Viết lại JD hoàn chỉnh và tóm tắt 2-3 câu cho ứng viên nghe.`,
  );

  const level = scoreToLevel(result.score);
  const audio = await synthesizeSpeech(result.audio_summary).catch(() => null);

  return {
    hr_result: { ...result, level, ableist_found: ableistFound },
    messages: [{ role: 'assistant', content: `Điểm hòa nhập: ${result.score}/100 (Mức ${level}). ${result.issues.length} vấn đề cần cải thiện.` }],
    tts_text: result.audio_summary,
    audio_base64: audio,
    nextStep: 'end',
  };
};
