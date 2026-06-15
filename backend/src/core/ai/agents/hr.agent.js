import { z } from 'zod';
import { analystModel } from '../llm/gemini.client.js';
import { synthesizeSpeech } from '../utils/tts.js';
import { logger } from '../../../packages/logger/index.js';

const ABLEIST = [
  { pattern: /nhìn thấy vấn đề/gi,  suggestion: 'nhận ra vấn đề' },
  { pattern: /nhanh nhẹn/gi,         suggestion: 'linh hoạt' },
  { pattern: /năng động/gi,          suggestion: 'chủ động, nhiệt tình' },
  { pattern: /quan sát trực tiếp/gi, suggestion: 'theo dõi, giám sát' },
  { pattern: /đẹp mắt/gi,            suggestion: 'chuyên nghiệp, rõ ràng' },
  { pattern: /bình thường/gi,        suggestion: 'không có yêu cầu đặc biệt' },
];

const detectAbleist = (text) =>
  ABLEIST.filter(({ pattern }) => pattern.test(text))
    .map(({ pattern, suggestion }) => ({ original: pattern.source.replace(/\\/g, ''), suggestion }));

const HRSchema = z.object({
  score:         z.number().min(0).max(100),
  issues:        z.array(z.string()),
  suggestions:   z.array(z.string()),
  rewritten_jd:  z.string(),
  audio_summary: z.string(),
});

const hrModel = analystModel.withStructuredOutput(HRSchema);
const scoreToLevel = (s) => s >= 80 ? 'AAA' : s >= 50 ? 'AA' : 'A';

export const hrNode = async (state) => {
  try {
  const jdText = state.messages[state.messages.length - 1]?.content || '';
  const ableistFound = detectAbleist(jdText);

  const result = await hrModel.invoke(
    `Bạn là chuyên gia inclusive hiring và WCAG 2.2.\n` +
    `Đánh giá JD (0-100) về mức độ thân thiện với người khiếm thị:\n\n"${jdText}"\n\n` +
    `Tiêu chí: ngôn ngữ rõ ràng (20đ), không yêu cầu thị giác không cần thiết (25đ), ` +
    `đề cập hỗ trợ accessibility (25đ), không bias vô thức (15đ), mô tả môi trường rõ (15đ).\n` +
    `Ngôn từ ableist đã phát hiện: ${ableistFound.map((a) => a.original).join(', ') || 'không có'}.\n` +
    `Viết lại JD hoàn chỉnh và tóm tắt 2-3 câu cho ứng viên nghe.`,
  );

  const level = scoreToLevel(result.score);

  return {
    hr_result: { ...result, level, ableist_found: ableistFound },
    messages: [{ role: 'assistant', content: `Điểm hòa nhập: ${result.score}/100 (Mức ${level}). ${result.issues.length} vấn đề cần cải thiện.` }],
    tts_text: result.audio_summary,
    audio_base64: await synthesizeSpeech(result.audio_summary).catch(() => null),
    nextStep: 'end',
  };
  } catch (err) {
    logger.error('[hrNode] Error:', err.message);
    return {
      hr_result:    { score: 0, level: 'A', issues: [err.message], suggestions: [], rewritten_jd: '', ableist_found: [] },
      messages:     [{ role: 'assistant', content: 'Xin lỗi, không thể phân tích JD lúc này. Vui lòng thử lại.' }],
      tts_text:     'Xin lỗi, không thể phân tích JD lúc này. Vui lòng thử lại.',
      audio_base64: null,
      nextStep:     'end',
      errors:       [err.message],
      error:        err.message,
    };
  }
};
