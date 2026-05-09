import { z } from 'zod';
import { analystModel } from '../shared/llm.js';
import { embedText } from '../shared/embedding.js';
import { synthesizeSpeech } from '../shared/tts.js';
import { SkillProfileRepository } from '../../../modules/ai/repositories/skill.profile.repository.js';

const CvSchema = z.object({
  summary:     z.string(),
  hard_skills: z.array(z.string()),
  soft_skills: z.array(z.string()),
  experience:  z.array(z.object({ title: z.string(), company: z.string(), duration: z.string(), description: z.string() })),
  education:   z.array(z.object({ degree: z.string(), institution: z.string(), year: z.string() })).optional(),
});

const cvModel = analystModel.withStructuredOutput(CvSchema);

// ── Verification sections (ordered) ──────────────────────────────────────────
const SECTIONS = ['skills', 'experience', 'education', 'summary'];

const readSection = (cv, section) => {
  switch (section) {
    case 'skills':
      return `Phần Kỹ năng: ${[...(cv.hard_skills || []), ...(cv.soft_skills || [])].slice(0, 5).join(', ')}.`;
    case 'experience':
      return cv.experience?.[0]
        ? `Phần Kinh nghiệm: ${cv.experience[0].title} tại ${cv.experience[0].company || 'công ty'}, ${cv.experience[0].duration || ''}.`
        : null;
    case 'education':
      return cv.education?.[0]
        ? `Phần Học vấn: ${cv.education[0].degree} tại ${cv.education[0].institution || 'trường'}.`
        : null;
    case 'summary':
      return `Phần Tóm tắt: ${(cv.summary || '').slice(0, 80)}.`;
    default:
      return null;
  }
};

// ── Intent detection from last user message ───────────────────────────────────
const detectIntent = (text = '') => {
  const t = text.toLowerCase();
  if (['xác nhận', 'đúng rồi', 'ok', 'được', 'lưu', 'đúng', 'tiếp'].some((k) => t.includes(k))) return 'confirm';
  if (['sửa lại', 'sai', 'không đúng', 'chỉnh', 'sửa'].some((k) => t.includes(k))) return 'reject';
  if (['thêm '].some((k) => t.includes(k))) return 'add';
  if (['bỏ ', 'xóa '].some((k) => t.includes(k))) return 'remove';
  return null;
};

// ── Resume Node ───────────────────────────────────────────────────────────────
export const resumeNode = async (state) => {
  const { profile, narrative_raw, messages, cv_data } = state;
  const lastMsg = messages[messages.length - 1];
  const intent = detectIntent(lastMsg?.content);

  // ── Phase 2: CV already generated → section-by-section verification ─────────
  if (cv_data) {
    const verifiedSections = state.verified_sections || [];

    // User confirmed current section → advance
    if (intent === 'confirm') {
      const nextSection = SECTIONS.find((s) => !verifiedSections.includes(s));

      if (!nextSection) {
        // All sections confirmed → save + go to match
        const tts = 'Hồ sơ đã được lưu. Đang tìm việc làm phù hợp cho bạn.';
        return {
          tts_text: tts,
          audio_base64: await synthesizeSpeech(tts).catch(() => null),
          nextStep: 'match',
        };
      }

      const sectionText = readSection(cv_data, nextSection);
      if (!sectionText) {
        // Skip empty section
        return resumeNode({ ...state, verified_sections: [...verifiedSections, nextSection] });
      }

      const tts = `${sectionText} Nói 'đúng rồi' để tiếp tục hoặc 'sửa lại' để chỉnh sửa.`;
      return {
        verified_sections: [...verifiedSections, nextSection],
        tts_text: tts,
        audio_base64: await synthesizeSpeech(tts).catch(() => null),
        nextStep: 'resume',
      };
    }

    // User rejected → go back to intake for that field
    if (intent === 'reject') {
      const tts = 'Bạn muốn sửa phần nào? Hãy nói tên phần cần sửa, ví dụ: kỹ năng, kinh nghiệm.';
      return {
        tts_text: tts,
        audio_base64: await synthesizeSpeech(tts).catch(() => null),
        nextStep: 'intake',
      };
    }

    // No clear intent → re-read current pending section
    const pendingSection = SECTIONS.find((s) => !verifiedSections.includes(s));
    if (pendingSection) {
      const sectionText = readSection(cv_data, pendingSection);
      const tts = sectionText
        ? `${sectionText} Nói 'đúng rồi' để tiếp tục hoặc 'sửa lại' để chỉnh sửa.`
        : 'Nói xác nhận để lưu hồ sơ.';
      return {
        tts_text: tts,
        audio_base64: await synthesizeSpeech(tts).catch(() => null),
        nextStep: 'resume',
      };
    }
  }

  // ── Phase 1: Generate CV + embed narrative_raw ────────────────────────────────
  const [cv, embedding] = await Promise.all([
    cvModel.invoke(
      `Tạo CV ATS-friendly 1 cột cho người khiếm thị. Không bảng, không ký tự đặc biệt.\n` +
      `Thứ tự: Thông tin cá nhân → Tóm tắt → Kỹ năng → Kinh nghiệm → Học vấn.\n` +
      `Profile: ${JSON.stringify(profile)}\nNarrative: ${narrative_raw}`,
    ),
    embedText(narrative_raw || JSON.stringify(profile)),
  ]);

  // Persist to MongoDB (fire-and-forget, don't block TTS)
  if (state.session_id) {
    SkillProfileRepository.upsert(state.session_id, {
      ...profile,
      narrative_raw,
      narrative_embedding: embedding,
      cv_data: cv,
    }).catch(() => {});
  }

  // Start verification with first section
  const firstSection = SECTIONS[0];
  const sectionText = readSection(cv, firstSection);
  const tts = `Hồ sơ đã được tạo. Tôi sẽ đọc từng phần để bạn xác nhận. ${sectionText} Nói 'đúng rồi' để tiếp tục hoặc 'sửa lại' để chỉnh sửa.`;
  const audio = await synthesizeSpeech(tts).catch(() => null);

  return {
    cv_data: cv,
    narrative_embedding: embedding,
    verified_sections: [firstSection],
    tts_text: tts,
    audio_base64: audio,
    nextStep: 'resume', // stay until all sections confirmed
  };
};
