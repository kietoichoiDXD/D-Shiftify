import { z } from 'zod';
import { routerModel } from '../llm/gemini.client.js';


const AT_MAP = {
  screen_reader: ['nvda', 'jaws', 'voiceover', 'narrator', 'trình đọc màn hình', 'đọc màn hình'],
  braille:       ['braille', 'chữ nổi', 'màn hình chữ nổi'],
  magnifier:     ['kính lúp', 'zoom text', 'phóng to màn hình', 'magnifier'],
  voice_control: ['điều khiển giọng nói', 'voice control', 'dragon naturally'],
};

export const detectATTools = (text) => {
  const lower = text.toLowerCase();
  return Object.entries(AT_MAP)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([need]) => need);
};

const NERSchema = z.object({
  hard_skills:     z.array(z.string()),
  soft_skills:     z.array(z.string()),
  inferred_skills: z.array(z.string()),
  experience:      z.array(z.object({ title: z.string(), company: z.string().optional(), duration: z.string().optional(), description: z.string().optional() })),
  education:       z.array(z.object({ degree: z.string(), institution: z.string().optional(), year: z.string().optional() })),
  at_tools:        z.array(z.string()),
});

const nerModel = routerModel.withStructuredOutput(NERSchema);

const SKILLS_TAXONOMY = {
  'nodejs': ['node.js', 'node js', 'node', 'nodejs'],
  'react': ['reactjs', 'react js', 'react.js', 'react'],
  'screen_reader': ['nvda', 'jaws', 'voiceover', 'narrator', 'trình đọc màn hình', 'đọc màn hình', 'screen reader'],
  'python': ['python3', 'python 3', 'python'],
  'excel': ['microsoft excel', 'ms excel', 'excel'],
  'english': ['tiếng anh', 'english', 'tieng anh'],
};

export const normalizeSkill = (skill) => {
  const lower = skill.toLowerCase().trim();
  for (const [standard, synonyms] of Object.entries(SKILLS_TAXONOMY)) {
    if (synonyms.includes(lower)) {
      return standard;
    }
  }
  return lower;
};

export const extractEntities = async (text) => {
  const at_tools = detectATTools(text);
  const result = await nerModel.invoke(
    `Trích xuất thông tin từ đoạn văn sau của người tìm việc khiếm thị tại Việt Nam.\n\n"${text}"\n\n` +
    `Với inferred_skills: suy ra kỹ năng ẩn từ thói quen/câu chuyện (vd: "đi chợ một mình" → "định vị độc lập").`,
  );
  
  const normalizedHard = (result.hard_skills || []).map(normalizeSkill);
  const normalizedSoft = (result.soft_skills || []).map(normalizeSkill);
  
  return { 
    ...result, 
    hard_skills: normalizedHard,
    soft_skills: normalizedSoft,
    at_tools: [...new Set([...(result.at_tools || []).map(normalizeSkill), ...at_tools.map(normalizeSkill)])] 
  };
};
