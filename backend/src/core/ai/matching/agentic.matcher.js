/**
 * Agentic RAG matcher — LLM-as-judge layer on top of the deterministic v2 engine.
 *
 * Design (no training / no fine-tuning):
 *   1. Retrieval + deterministic scoring happen upstream (evaluateMatch in match.scoring.js).
 *   2. This layer asks Gemini 2.5 Flash to RE-SCORE only the "fuzzy" criteria that the
 *      Tiêu chí v2 spec explicitly says require human-like judgement:
 *        - experience  (chức vụ liên quan / kỹ năng chuyển đổi)
 *        - career_goal (mục tiêu nghề nghiệp khớp định hướng)
 *        - soft_skills (kỹ năng mềm khớp tính chất công việc)
 *        - certificates(chứng chỉ liên quan vs khóa ngắn hạn)
 *        - custom      (trường phụ do người dùng thêm)
 *   3. Objective criteria (priority, devices, hard_skills) stay deterministic — they are
 *      computed exactly by formula, so the LLM never overrides them.
 *   4. The model is grounded ONLY in the supplied CV + JD evidence (RAG) and must return
 *      strict JSON. Any failure (no API key, bad JSON, timeout) falls back to the
 *      deterministic result unchanged — the feature degrades gracefully, never breaks.
 */

import { sanitizeAbleist } from '../utils/ableist.js';
import { MATCHING_CRITERIA_V2 } from '../retrieval/match.scoring.js';

// gemini.client.js throws at module load when GEMINI_API_KEY is missing, so it is imported
// lazily — only after AI_ENABLED() confirms the key exists. This keeps the deterministic
// matching path importable (and working) on deployments without a Gemini key.
let analystModelPromise = null;
const getAnalystModel = async () => {
    if (!analystModelPromise) {
        analystModelPromise = import('../llm/gemini.client.js').then(mod => mod.analystModel);
    }
    return analystModelPromise;
};

const LLM_CRITERIA = ['experience', 'career_goal', 'soft_skills', 'certificates', 'custom'];
const AI_ENABLED = () => Boolean(process.env.GEMINI_API_KEY) && process.env.AI_MATCH_DISABLE_LLM !== 'true';
const CACHE_TTL_MS = Number.parseInt(process.env.AI_MATCH_CACHE_TTL_MS || '600000', 10); // 10 min
const LLM_TIMEOUT_MS = Number.parseInt(process.env.AI_MATCH_LLM_TIMEOUT_MS || '12000', 10);

const cache = new Map();

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(Number(value) || 0, min), max);

const cacheKey = (profile, job) =>
    `${profile.id || ''}:${job.id || ''}:${(job.updatedAt || job.updated_at || '')}`;

const readCache = key => {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
    if (hit) cache.delete(key);
    return null;
};

const writeCache = (key, value) => {
    cache.set(key, { at: Date.now(), value });
    if (cache.size > 500) cache.delete(cache.keys().next().value);
};

const withTimeout = (promise, ms) =>
    Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout')), ms)),
    ]);

const stringify = value => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
        return value
            .map(item => (typeof item === 'object' ? item.name || item.title || item.label || JSON.stringify(item) : item))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const buildEvidence = (profile, job) => ({
    job: {
        title: job.title,
        experienceRequired: job.experienceRequired || job.experience_required || 'Không nêu rõ',
        description: String(job.description || '').slice(0, 1200),
        requiredSkills: stringify(job.skills),
        requiredCertificates: stringify(job.certificates || job.requiredCertificates),
    },
    candidate: {
        expectedJob: profile.expectedJob || profile.expected_job || profile.careerGoal || '',
        experiences: stringify(profile.experiences || profile.experience),
        skills: stringify(profile.skills),
        certificates: stringify(profile.certificates),
        customSections: stringify(profile.customSections || profile.custom_sections),
    },
});

const parseJson = raw => {
    const text = typeof raw === 'string' ? raw : raw?.content ?? '';
    const cleaned = String(text).replace(/```json|```/gi, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object in LLM output');
    return JSON.parse(cleaned.slice(start, end + 1));
};

const buildPrompt = evidence => {
    const labels = MATCHING_CRITERIA_V2.filter(c => LLM_CRITERIA.includes(c.key))
        .map(c => `- ${c.key}: ${c.label}`)
        .join('\n');
    return [
        'Bạn là chuyên gia tuyển dụng hòa nhập cho người khuyết tật. Chấm điểm độ phù hợp giữa ứng viên và công việc',
        'CHỈ dựa trên dữ kiện dưới đây (không suy diễn ngoài dữ kiện). Cho điểm 0-100 cho từng tiêu chí sau:',
        labels,
        '',
        'Quy tắc chấm:',
        '- experience: 75đ khớp chức vụ, 50đ liên quan, 25đ ít liên quan (kỹ năng chuyển đổi), 0đ không liên quan; cộng tối đa 25đ theo thời gian phù hợp. Trả tổng 0-100.',
        '- career_goal: 70-100 nếu định hướng khớp cơ hội phát triển; 40-69 nếu chỉ mong ổn định/hòa nhập; 0-39 nếu mâu thuẫn.',
        '- soft_skills: 80-100 rất khớp tính chất công việc; 50-79 cơ bản; 0-49 không liên quan/không có.',
        '- certificates: 80-100 đúng chứng chỉ JD yêu cầu; 50-79 khóa ngắn hạn/online/trung tâm nghề; 0 không liên quan.',
        '- custom: mức độ trường phụ của ứng viên khớp mô tả công việc.',
        '',
        `CÔNG VIỆC:\n${JSON.stringify(evidence.job, null, 2)}`,
        `ỨNG VIÊN:\n${JSON.stringify(evidence.candidate, null, 2)}`,
        '',
        'Trả về DUY NHẤT một object JSON hợp lệ dạng:',
        '{"scores":{"experience":<0-100>,"career_goal":<0-100>,"soft_skills":<0-100>,"certificates":<0-100>,"custom":<0-100>},',
        '"reasons":{"experience":"<1 câu>","career_goal":"<1 câu>","soft_skills":"<1 câu>","certificates":"<1 câu>","custom":"<1 câu>"},',
        '"explanation":"<2 câu thân thiện, dễ nghe qua loa, vì sao phù hợp>"}',
    ].join('\n');
};

/**
 * Refine a deterministic match result with the Gemini judge. Returns a NEW result object;
 * on any failure returns the original deterministic result with `aiRefined: false`.
 *
 * @param {object} profile candidate profile (same shape evaluateMatch receives)
 * @param {object} job job record
 * @param {object} deterministic result from evaluateMatch(profile, job, priorities)
 */
export const refineMatchWithAI = async (profile, job, deterministic) => {
    if (!AI_ENABLED() || !deterministic?.criteria?.length) {
        return { ...deterministic, aiRefined: false };
    }

    const key = cacheKey(profile, job);
    const cached = readCache(key);
    if (cached) return cached;

    try {
        const evidence = buildEvidence(profile, job);
        const analystModel = await getAnalystModel();
        const response = await withTimeout(analystModel.invoke(buildPrompt(evidence)), LLM_TIMEOUT_MS);
        const parsed = parseJson(response);
        const aiScores = parsed.scores || {};
        const aiReasons = parsed.reasons || {};

        const criteria = deterministic.criteria.map(criterion => {
            if (!LLM_CRITERIA.includes(criterion.key) || aiScores[criterion.key] === undefined) {
                return criterion;
            }
            const score = clamp(aiScores[criterion.key]);
            return {
                ...criterion,
                score,
                contribution: Number((score * criterion.weight).toFixed(2)),
                reason: aiReasons[criterion.key] ? sanitizeAbleist(String(aiReasons[criterion.key])) : criterion.reason,
                source: 'ai',
            };
        });

        const totalScore = Math.round(criteria.reduce((sum, item) => sum + item.contribution, 0));
        const strengths = criteria.filter(item => item.score >= 80).map(item => item.label);
        const gaps = criteria.filter(item => item.score < 50).map(item => item.label);
        const explanation = parsed.explanation
            ? sanitizeAbleist(String(parsed.explanation))
            : deterministic.explanation;

        const refined = {
            ...deterministic,
            score: totalScore,
            criteria,
            strengths,
            gaps,
            explanation,
            aiRefined: true,
        };
        writeCache(key, refined);
        return refined;
    } catch (error) {
        return { ...deterministic, aiRefined: false, aiError: error.message };
    }
};
