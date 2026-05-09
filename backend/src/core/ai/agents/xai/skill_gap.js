import { analystModel } from '../shared/llm.js';

const GAP_THRESHOLD = parseInt(process.env.SKILL_GAP_THRESHOLD || '70', 10);

// ── Static course catalog (partner courses, accessible format) ────────────────
const COURSE_CATALOG = [
  { skill: 'excel', course: 'Excel cơ bản đến nâng cao', provider: 'Gitiho', url: 'https://gitiho.com', duration: '10 giờ' },
  { skill: 'word',  course: 'Microsoft Word cho người đi làm', provider: 'Gitiho', url: 'https://gitiho.com', duration: '6 giờ' },
  { skill: 'python', course: 'Python cơ bản', provider: 'Coursera', url: 'https://coursera.org', duration: '20 giờ' },
  { skill: 'giao tiếp', course: 'Kỹ năng giao tiếp chuyên nghiệp', provider: 'Edumall', url: 'https://edumall.vn', duration: '5 giờ' },
  { skill: 'tiếng anh', course: 'Tiếng Anh giao tiếp', provider: 'ELSA Speak', url: 'https://elsaspeak.com', duration: 'Tự học' },
  { skill: 'kế toán', course: 'Kế toán thực hành', provider: 'Kyna', url: 'https://kyna.vn', duration: '15 giờ' },
  { skill: 'chăm sóc khách hàng', course: 'Kỹ năng CSKH qua điện thoại', provider: 'Edumall', url: 'https://edumall.vn', duration: '4 giờ' },
  { skill: 'nvda', course: 'Sử dụng NVDA hiệu quả', provider: 'NVAccess', url: 'https://nvaccess.org', duration: '3 giờ' },
];

/** Find static course for a skill keyword */
const findCourse = (skill) => {
  const lower = skill.toLowerCase();
  return COURSE_CATALOG.find((c) => lower.includes(c.skill) || c.skill.includes(lower)) || null;
};

/**
 * Analyze skill gap between candidate profile and job.
 * Returns null if score >= threshold (no gap needed).
 *
 * @param {object} profile  - candidate profile with hard_skills, soft_skills, inferred_skills
 * @param {object} job      - job with required_skills[], title
 * @param {number} score    - final_score (0-100)
 * @returns {Promise<{missing_skills, courses, ai_recommendation, tts_text}|null>}
 */
export const analyzeSkillGap = async (profile, job, score) => {
  if (score >= GAP_THRESHOLD) return null;

  const allSkills = new Set([
    ...(profile.hard_skills || []),
    ...(profile.soft_skills || []),
    ...(profile.inferred_skills || []),
  ].map((s) => s.toLowerCase()));

  const missing = (job.required_skills || []).filter(
    (s) => !allSkills.has(s.toLowerCase()),
  );

  if (!missing.length) return null;

  // Static course lookup (fast, no LLM)
  const courses = missing.map((skill) => ({
    skill,
    ...(findCourse(skill) || { course: null, provider: null, url: null, duration: null }),
  }));

  // AI recommendation for skills without static course
  const noCourseMissing = missing.filter((s) => !findCourse(s));
  let ai_recommendation = null;
  if (noCourseMissing.length) {
    const res = await analystModel.invoke(
      `Ứng viên khiếm thị tại Việt Nam thiếu kỹ năng: ${noCourseMissing.join(', ')}.\n` +
      `Gợi ý 1-2 khóa học ngắn hạn, miễn phí hoặc rẻ, phù hợp học online qua screen reader.\n` +
      `Trả lời ngắn gọn, đọc được qua loa, không dùng ký tự đặc biệt.`,
    );
    ai_recommendation = typeof res === 'string' ? res : res.content;
  }

  // TTS-ready text
  const topMissing = missing.slice(0, 2).join(' và ');
  const topCourse = courses.find((c) => c.course);
  const tts_text = topCourse
    ? `Bạn còn thiếu kỹ năng ${topMissing}. Bạn có thể học ${topCourse.course} tại ${topCourse.provider} trong ${topCourse.duration}. Nói 'học ngay' để biết thêm chi tiết.`
    : `Bạn còn thiếu kỹ năng ${topMissing}. ${ai_recommendation || ''} Nói 'học ngay' để biết thêm chi tiết.`;

  return { missing_skills: missing, courses, ai_recommendation, tts_text };
};
