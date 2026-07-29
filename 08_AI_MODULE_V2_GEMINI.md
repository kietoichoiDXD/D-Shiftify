# D-Shiftify — AI Module v2 (Full Gemini Stack + Scoring Algorithm v2)
> Đã thay Groq Whisper → Gemini STT
> Đã thay Google Translate TTS → Gemini 2.5 Flash TTS / 3.1 Flash TTS Preview
> Scoring algorithm v2 theo tài liệu Tiêu chí v2.md

---

## 1. Gemini Audio Model Map (Research tháng 6/2026)

| Use case | Model | API | Notes |
|---|---|---|---|
| **STT (batch)** | `gemini-2.5-flash` | generateContent + inline audio | base64 audio ≤20MB, tiếng Việt ✅ |
| **STT (realtime stream)** | `gemini-2.5-flash-native-audio` | Live API WebSocket | PCM 16kHz, latency <300ms |
| **TTS (production)** | `gemini-2.5-flash-tts` | generateContent speech_config | 30 voices, 24 langs, tiếng Việt ✅ |
| **TTS (streaming)** | `gemini-3.1-flash-tts-preview` | generateContent stream=true | 70+ langs, audio tags, SynthID watermark |
| **LLM (agents)** | `gemini-2.5-flash` | generateContent | tất cả agent nodes |
| **Embedding** | `text-embedding-004` | embedContent | 768 dims |

**Recommended stack cho D-Shiftify:**
- STT: `gemini-2.5-flash` batch (POST /ai/voice) + `gemini-2.5-flash-native-audio` Live API (realtime chat)
- TTS: `gemini-2.5-flash-tts` (stable, production-ready, tiếng Việt)
- LLM: `gemini-2.5-flash` (best price/performance, free tier 500 RPD)

---

## 2. Scoring Algorithm v2 — Theo tài liệu chính thức

### 2.1 Default weights (8 tiêu chí)

```
Bộ trọng số cố định theo thứ tự:
[25%, 20%, 15%, 15%, 10%, 5%, 5%, 5%]
```

| # | Tiêu chí | Weight mặc định |
|---|---|---|
| 1 | Ưu tiên công việc | 25% |
| 2 | Kinh nghiệm làm việc | 20% |
| 3 | Thiết bị hiện có | 15% |
| 4 | Mục tiêu nghề nghiệp | 15% |
| 5 | Kỹ năng cứng | 10% |
| 6 | Kỹ năng mềm | 5% |
| 7 | Chứng chỉ | 5% |
| 8 | Trường phụ | 5% |

### 2.2 Kinh nghiệm làm việc — 4 mức relevance

| Mức | Áp dụng | Hệ số quy đổi thời gian |
|---|---|---|
| 1 (Khớp chính xác) | Chức vụ trùng hoặc đồng nghĩa | 1.0× |
| 2 (Liên quan chặt) | Khác ngành, cùng skill cốt lõi | 0.5× |
| 3 (Ít liên quan) | Khác ngành, có skill mềm chuyển đổi | 0.25× |
| 4 (Không liên quan) | Không có điểm chung | 0× |

---

## 3. Code: Scoring Engine v2 (match.scoring.js)

```javascript
// src/core/modules/ai/agents/match/match.scoring.v2.js

const FIXED_WEIGHTS = [0.25, 0.20, 0.15, 0.15, 0.10, 0.05, 0.05, 0.05];
const DEFAULT_CRITERIA_ORDER = [
  'job_priority',    // 1 — ưu tiên công việc
  'experience',      // 2 — kinh nghiệm làm việc
  'devices',         // 3 — thiết bị hiện có
  'career_goal',     // 4 — mục tiêu nghề nghiệp
  'hard_skills',     // 5 — kỹ năng cứng
  'soft_skills',     // 6 — kỹ năng mềm
  'certificates',    // 7 — chứng chỉ
  'custom_fields',   // 8 — trường phụ
];

/**
 * Tính trọng số dựa trên thứ tự tick của user
 * @param {string[]} tickedOrder - Danh sách tiêu chí user đã tick, theo thứ tự
 * @returns {{ [criterion]: weight }} - Map criterion → weight
 */
function computeWeights(tickedOrder = []) {
  if (!tickedOrder || tickedOrder.length === 0) {
    // Case 2: Không tick → dùng mặc định
    return Object.fromEntries(
      DEFAULT_CRITERIA_ORDER.map((c, i) => [c, FIXED_WEIGHTS[i]])
    );
  }

  // Case 1: Có tick
  const ticked = tickedOrder;
  const notTicked = DEFAULT_CRITERIA_ORDER.filter(c => !ticked.includes(c));

  // Gán weights: ticked nhận weights cao nhất, notTicked tiếp theo
  const ordered = [...ticked, ...notTicked];
  return Object.fromEntries(
    ordered.map((c, i) => [c, FIXED_WEIGHTS[i]])
  );
}

// ── Tiêu chí 1: Ưu tiên công việc ────────────────────────────────────────────
function scoreJobPriority(profile, job) {
  // Ưu tiên công ty tốt: company có rating cao trong DB
  // Ưu tiên gần nhà: dùng haversine
  // Ưu tiên ít giao thông: meta field từ JD
  // Trả về 100 nếu match, 50 nếu không match
  const prefs = profile.preferences || {};

  // Geo check
  if (prefs.location_lat && job.location_lat) {
    const { haversineKm } = require('../shared/geo');
    const km = job.is_remote ? 0
      : haversineKm(prefs.location_lat, prefs.location_lng, job.location_lat, job.location_lng);
    const radius = prefs.radius_km || 10;
    if (km <= radius || job.is_remote) return 100;
    if (km <= radius * 2) return 75;
    return 50;
  }

  // Nếu job remote và candidate muốn remote
  if (job.is_remote && prefs.remote) return 100;

  return 50; // không đủ data → neutral
}

// ── Tiêu chí 2: Kinh nghiệm làm việc ─────────────────────────────────────────
function scoreExperience(profile, job, relevanceLevel) {
  // relevanceLevel từ AI NER analysis: 1 | 2 | 3 | 4
  const conversionRate = { 1: 1.0, 2: 0.5, 3: 0.25, 4: 0 };
  const rate = conversionRate[relevanceLevel] ?? 0.25;

  // Tổng tháng làm việc hợp lệ sau quy đổi
  const totalRawMonths = (profile.experience || [])
    .reduce((sum, e) => sum + (e.duration_months || 0), 0);
  const validMonths = totalRawMonths * rate;
  const requiredMonths = job.experience_required_months || 0;

  // Điểm chức vụ (75đ tối đa)
  const titleScoreMap = { 1: 75, 2: 50, 3: 25, 4: 0 };
  const titleScore = titleScoreMap[relevanceLevel] ?? 25;

  // Điểm thời gian (25đ tối đa)
  let timeScore;
  if (requiredMonths === 0) {
    timeScore = 25; // không yêu cầu kinh nghiệm
  } else if (validMonths >= requiredMonths) {
    timeScore = 25;
  } else {
    timeScore = (validMonths / requiredMonths) * 100 * 0.25;
  }

  // Tổng điểm kinh nghiệm (0-100)
  return Math.min(Math.round(titleScore + timeScore), 100);
}

// ── Tiêu chí 3: Thiết bị hiện có ─────────────────────────────────────────────
function scoreDevices(profile, job) {
  const requiredDevices = job.required_devices || []; // e.g. ['laptop', 'smartphone']
  const candidateDevices = profile.devices || [];     // e.g. ['smartphone']

  if (requiredDevices.length === 0) return 100; // không yêu cầu

  const pointPerDevice = 100 / requiredDevices.length;
  const matched = requiredDevices.filter(d =>
    candidateDevices.some(cd => cd.toLowerCase().includes(d.toLowerCase()))
  );
  return Math.round(matched.length * pointPerDevice);
}

// ── Tiêu chí 4: Mục tiêu nghề nghiệp ────────────────────────────────────────
// AI sẽ trả về điểm này (LLM analysis), nhưng nếu không có thì dùng heuristic
function scoreCareerGoal(profile, job, aiScore = null) {
  if (aiScore !== null) return Math.max(0, Math.min(100, aiScore));

  // Heuristic: dựa trên desired_roles vs job title
  const desired = (profile.preferences?.desired_roles || []).map(r => r.toLowerCase());
  if (desired.length === 0) return 50; // unknown → neutral
  const jobTitle = (job.title || '').toLowerCase();
  const matches = desired.filter(r => jobTitle.includes(r) || r.includes(jobTitle));
  if (matches.length > 0) return 85;
  return 45;
}

// ── Tiêu chí 5: Kỹ năng cứng ─────────────────────────────────────────────────
function scoreHardSkills(profile, job) {
  const required = (job.required_skills || []).map(s => s.toLowerCase());
  const candidate = [
    ...(profile.hard_skills || []),
    ...(profile.inferred_skills || []),
  ].map(s => s.toLowerCase());

  if (required.length === 0) return 90;
  const matched = required.filter(r =>
    candidate.some(c => c.includes(r) || r.includes(c))
  );
  const pct = (matched.length / required.length) * 100;

  if (pct >= 80) return Math.round(80 + pct * 0.2); // 80-100
  if (pct >= 50) return Math.round(50 + pct * 0.29); // 50-79
  return Math.round(pct * 0.49);                       // 0-49
}

// ── Tiêu chí 6: Kỹ năng mềm ──────────────────────────────────────────────────
function scoreSoftSkills(profile, job, aiScore = null) {
  if (aiScore !== null) return Math.max(0, Math.min(100, aiScore));

  const jobSoftSkills = job.soft_skills_required || [];
  const candidateSoft = (profile.soft_skills || []).map(s => s.toLowerCase());

  if (jobSoftSkills.length === 0) return 65; // không yêu cầu cụ thể
  const matched = jobSoftSkills.filter(s =>
    candidateSoft.some(c => c.includes(s.toLowerCase()))
  );
  const pct = (matched.length / jobSoftSkills.length) * 100;
  if (pct >= 80) return Math.round(80 + pct * 0.2);
  if (pct >= 50) return Math.round(50 + pct * 0.3);
  return Math.round(pct * 0.5);
}

// ── Tiêu chí 7: Chứng chỉ ────────────────────────────────────────────────────
function scoreCertificates(profile, job) {
  const requiredCerts = job.required_certificates || [];
  const candidateCerts = (profile.certificates || []).map(c => ({
    name: c.name?.toLowerCase() || '',
    type: c.type || 'formal', // formal | online | vocational
  }));

  if (requiredCerts.length === 0) return 75; // không yêu cầu chứng chỉ cụ thể

  const required = requiredCerts.map(c => c.toLowerCase());
  const hasExact = required.some(r =>
    candidateCerts.some(c => c.name.includes(r) && c.type === 'formal')
  );
  if (hasExact) return 90;

  const hasRelated = candidateCerts.some(c =>
    c.type === 'online' || c.type === 'vocational'
  );
  if (hasRelated) return 65;

  return 0;
}

// ── Tiêu chí 8: Trường phụ (user-defined) ────────────────────────────────────
function scoreCustomFields(profile, job, customFields = []) {
  if (!customFields || customFields.length === 0) return 70; // không có → neutral

  // Điểm bình quân các trường phụ
  const scores = customFields.map(field => field.score || 50);
  const total = scores.reduce((sum, s) => sum + s, 0);
  return Math.round(total / customFields.length);
}

// ── Master scorer ─────────────────────────────────────────────────────────────
/**
 * Tính tổng điểm matching theo tài liệu Tiêu chí v2
 * @param {Object} profile - Candidate profile
 * @param {Object} job - Job description
 * @param {Object} opts - { tickedOrder, relevanceLevel, aiScores, customFields }
 * @returns {Object} { total, breakdown, weights }
 */
function calculateScorev2(profile, job, opts = {}) {
  const {
    tickedOrder = [],      // thứ tự tick của user
    relevanceLevel = 2,    // AI-computed: 1|2|3|4
    aiScores = {},         // { career_goal: 85, soft_skills: 70 } — AI-scored dims
    customFields = [],     // [{ name, score }]
  } = opts;

  const weights = computeWeights(tickedOrder);

  const scores = {
    job_priority:  scoreJobPriority(profile, job),
    experience:    scoreExperience(profile, job, relevanceLevel),
    devices:       scoreDevices(profile, job),
    career_goal:   scoreCareerGoal(profile, job, aiScores.career_goal ?? null),
    hard_skills:   scoreHardSkills(profile, job),
    soft_skills:   scoreSoftSkills(profile, job, aiScores.soft_skills ?? null),
    certificates:  scoreCertificates(profile, job),
    custom_fields: scoreCustomFields(profile, job, customFields),
  };

  // Tổng điểm có trọng số
  const total = Object.entries(scores).reduce((sum, [criterion, score]) => {
    const w = weights[criterion] || 0;
    return sum + score * w;
  }, 0);

  return {
    total: Math.round(total),
    breakdown: scores,
    weights,
    relevance_level: relevanceLevel,
  };
}

module.exports = {
  calculateScorev2,
  computeWeights,
  DEFAULT_CRITERIA_ORDER,
  FIXED_WEIGHTS,
};
```

---

## 4. Code: Gemini STT (stt.js — thay Groq Whisper)

```javascript
// src/core/modules/ai/agents/shared/stt.js
const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// MIME type map
const MIME_MAP = {
  webm:  'audio/webm',
  mp3:   'audio/mp3',
  wav:   'audio/wav',
  ogg:   'audio/ogg',
  m4a:   'audio/mp4',
  flac:  'audio/flac',
  pcm:   'audio/pcm',
  mp4:   'audio/mp4',
};

// Post-process Vietnamese speech artifacts
function cleanVietnamese(text) {
  return text
    .replace(/\b(\w+)\s+\1\b/gi, '$1')          // repeated words
    .replace(/\b(ừm|à|ờ|ư|hmm|uh|um|ơ)\b/gi, '') // filler
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transcribe audio via Gemini 2.5 Flash (batch, inline base64)
 * Max 20MB total request size
 */
async function transcribeAudio(audioBase64, encoding = 'webm') {
  const mimeType = MIME_MAP[encoding.toLowerCase()] || 'audio/webm';

  // Size check (base64 ≈ 1.37× raw size)
  const rawSizeBytes = Math.ceil(audioBase64.length * 0.75);
  if (rawSizeBytes > 18 * 1024 * 1024) { // 18MB buffer (API limit 20MB)
    throw new Error('AUDIO_TOO_LARGE: Tối đa 18MB');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      text: `Hãy chuyển đổi đoạn âm thanh tiếng Việt này thành văn bản.
Yêu cầu:
- Chỉ trả về văn bản transcript thuần túy, không giải thích
- Giữ nguyên tiếng Việt, không dịch
- Không thêm dấu câu nếu người nói không có
- Bỏ qua tiếng ồn, chỉ transcript lời nói`,
    },
    {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    },
  ]);

  const raw = result.response.text();
  return cleanVietnamese(raw);
}

module.exports = { transcribeAudio };
```

---

## 5. Code: Gemini TTS (tts.js — thay Google Translate TTS)

```javascript
// src/core/modules/ai/agents/shared/tts.js
const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Vietnamese TTS-safe voice — Zephyr sounds natural for vi
const TTS_VOICE = process.env.GEMINI_TTS_VOICE || 'Zephyr';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-tts';

// ── Sanitize text for TTS ──────────────────────────────────────────────────
function sanitizeForTTS(text) {
  return text
    // Remove markdown
    .replace(/[*_#>`~]/g, '')
    // Replace special chars with spoken equivalents
    .replace(/→|->|⟶/g, ', ')
    .replace(/\//g, ' trên ')
    .replace(/&/g, ' và ')
    // Spell out numbers with %
    .replace(/(\d+)%/g, (_, n) => `${spellNumber(n)} phần trăm`)
    // Spell out currency
    .replace(/(\d+)đ/g, (_, n) => `${spellNumber(n)} đồng`)
    .replace(/(\d+)k\b/g, (_, n) => `${spellNumber(parseInt(n) * 1000)} đồng`)
    // Remove code-like content
    .replace(/`[^`]+`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function spellNumber(n) {
  const num = parseInt(n);
  if (isNaN(num)) return n;
  if (num < 10) return ['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'][num];
  if (num < 100) {
    const t = ['','mười','hai mươi','ba mươi','bốn mươi','năm mươi',
               'sáu mươi','bảy mươi','tám mươi','chín mươi'];
    const o = ['','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
    const tens = Math.floor(num / 10), ones = num % 10;
    return ones === 0 ? t[tens] : `${t[tens]} ${o[ones]}`;
  }
  return n.toString(); // fallback cho số lớn
}

// Ensure max 20 words per sentence for TTS readability
function ensureShortSentences(text, maxWords = 20) {
  return text.split(/[.!?]+/).map(s => {
    s = s.trim();
    if (!s) return '';
    const words = s.split(' ');
    if (words.length <= maxWords) return s;
    // Split long sentence at comma or natural break
    const chunks = [];
    let current = [];
    for (const w of words) {
      current.push(w);
      if (current.length >= maxWords || w.endsWith(',')) {
        chunks.push(current.join(' ').replace(/,$/, ''));
        current = [];
      }
    }
    if (current.length) chunks.push(current.join(' '));
    return chunks.join('. ');
  }).filter(Boolean).join('. ');
}

/**
 * Synthesize Vietnamese speech via Gemini 2.5 Flash TTS
 * Returns base64 PCM audio (24kHz, 16-bit, mono)
 */
async function synthesize(text) {
  try {
    const cleaned = sanitizeForTTS(text);
    const shortened = ensureShortSentences(cleaned);

    const model = genAI.getGenerativeModel({ model: TTS_MODEL });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: shortened }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: TTS_VOICE },
          },
          languageCode: 'vi-VN',
        },
      },
    });

    // Extract PCM audio data
    const part = result.response.candidates[0].content.parts[0];
    if (!part?.inlineData?.data) {
      console.warn('[TTS] No audio data returned');
      return null;
    }

    return part.inlineData.data; // base64 PCM 24kHz 16-bit mono
  } catch (err) {
    console.error('[TTS] Gemini TTS error:', err.message);
    // Fallback: return null, client shows text instead of audio
    return null;
  }
}

/**
 * Streaming TTS using gemini-3.1-flash-tts-preview
 * Returns AsyncIterator of base64 PCM chunks
 */
async function* synthesizeStream(text) {
  const cleaned = sanitizeForTTS(text);

  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-tts-preview' });

  const stream = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: cleaned }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: TTS_VOICE },
        },
        languageCode: 'vi-VN',
      },
    },
  });

  for await (const chunk of stream.stream) {
    const parts = chunk.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        yield part.inlineData.data;
      }
    }
  }
}

// LangGraph TTS node
async function ttsNode(state) {
  if (!state.tts_text) return { audio_base64: null };
  const audio = await synthesize(state.tts_text);
  return { audio_base64: audio };
}

module.exports = { synthesize, synthesizeStream, sanitizeForTTS, ttsNode };
```

---

## 6. Code: Match Agent v2 (tích hợp scoring v2 + AI scoring)

```javascript
// src/core/modules/ai/agents/match/match.agent.js
const { retrieverNode } = require('./match.retriever');
const { calculateScorev2 } = require('./match.scoring.v2');
const { explainMatch } = require('./match.explainer');
const { callLLMJson } = require('../shared/llm');

// AI đánh giá các tiêu chí cần LLM analysis
const AI_SCORING_PROMPT = `Phân tích mức độ phù hợp giữa ứng viên và vị trí công việc.

THÔNG TIN ỨNG VIÊN:
{profile}

THÔNG TIN CÔNG VIỆC:
{job}

Trả về JSON:
{
  "relevance_level": 1,
  // 1=Khớp chính xác, 2=Liên quan chặt, 3=Ít liên quan, 4=Không liên quan
  "career_goal_score": 0-100,
  // 70-100: lộ trình cá nhân khớp; 40-69: muốn ổn định; 0-39: mâu thuẫn
  "soft_skill_score": 0-100,
  // 80-100: đặc biệt khớp; 50-79: cơ bản; 0-49: không liên quan
  "reasoning": "Lý do 1 câu"
}`;

async function getAIScores(profile, job) {
  try {
    const prompt = AI_SCORING_PROMPT
      .replace('{profile}', JSON.stringify({
        experience: profile.experience,
        hard_skills: profile.hard_skills,
        soft_skills: profile.soft_skills,
        preferences: profile.preferences,
      }))
      .replace('{job}', JSON.stringify({
        title: job.title,
        description_raw: job.description_raw?.substring(0, 500),
        required_skills: job.required_skills,
        soft_skills_required: job.soft_skills_required,
        experience_required_months: job.experience_required_months,
      }));

    return await callLLMJson(prompt, 'Analyze match', { temperature: 0.1 });
  } catch {
    return { relevance_level: 2, career_goal_score: 50, soft_skill_score: 50 };
  }
}

async function matchNode(state) {
  try {
    const topK = parseInt(process.env.MATCH_TOP_K_VOICE) || 3;

    // 1. pgvector ANN search → top-50
    const candidateJobs = await retrieverNode(state.narrative_embedding, { top_k: 50 });
    if (!candidateJobs.length) {
      return {
        matches: [],
        tts_text: 'Hiện tại chưa có việc làm phù hợp. Hệ thống sẽ thông báo khi có việc mới.',
      };
    }

    // 2. Score với AI analysis (parallel để giảm latency)
    const scoredJobs = await Promise.all(
      candidateJobs.slice(0, 20).map(async (job) => {
        const aiScores = await getAIScores(state.profile, job);
        const result = calculateScorev2(state.profile, job, {
          tickedOrder: state.matching_weights?.ticked_order || [],
          relevanceLevel: aiScores.relevance_level || 2,
          aiScores: {
            career_goal: aiScores.career_goal_score,
            soft_skills: aiScores.soft_skill_score,
          },
        });
        return { ...job, ...result };
      })
    );

    // 3. Sort + take top K
    const topJobs = scoredJobs
      .sort((a, b) => b.total - a.total)
      .slice(0, topK);

    // 4. Generate explanations
    const withExplanations = await Promise.all(
      topJobs.map(async (job) => {
        const explanation = await explainMatch(state.profile, job);
        return { ...job, explanation };
      })
    );

    // 5. Skill gap analysis
    const skillGaps = analyzeSkillGaps(state.profile, topJobs[0]);

    // 6. TTS text
    const first = withExplanations[0];
    const ttsText = [
      `Đã tìm thấy ${withExplanations.length} việc làm phù hợp.`,
      `Việc làm đầu tiên: ${first.title} tại ${first.company_name || first.company}.`,
      `Điểm phù hợp: ${first.total} trên một trăm.`,
      first.explanation,
      withExplanations.length > 1 ? "Nói 'tiếp theo' để nghe việc làm kế tiếp." : '',
    ].filter(Boolean).join(' ');

    return {
      matches: withExplanations,
      skill_gaps: skillGaps,
      tts_text: ttsText,
    };
  } catch (err) {
    return {
      errors: [err.message],
      matches: [],
      tts_text: 'Không thể tìm kiếm việc làm lúc này. Vui lòng thử lại.',
    };
  }
}

function analyzeSkillGaps(profile, topJob) {
  if (!topJob) return [];
  const required = topJob.required_skills || [];
  const have = [
    ...(profile.hard_skills || []),
    ...(profile.inferred_skills || []),
  ].map(s => s.toLowerCase());

  return required
    .filter(r => !have.some(h => h.includes(r.toLowerCase())))
    .slice(0, 3) // max 3 skill gaps
    .map(skill => ({ skill, recommendation: `Học thêm kỹ năng ${skill}` }));
}

module.exports = { matchNode };
```

---

## 7. Code: Explainer v2 (tiếng Việt, TTS-safe)

```javascript
// src/core/modules/ai/agents/match/match.explainer.js
const { callLLM } = require('../shared/llm');

const EXPLAIN_PROMPT = `Giải thích ngắn gọn (TỐI ĐA 25 từ) vì sao công việc phù hợp với ứng viên.
QUY TẮC:
- Không dùng số phần trăm
- Không dùng ký tự đặc biệt
- Câu hoàn chỉnh, tự nhiên như đang nói chuyện
- Nêu lý do cụ thể nhất (kỹ năng, kinh nghiệm, hỗ trợ công nghệ)

Điểm breakdown: {breakdown}
Công việc: {job_title} tại {company}
Điểm cao nhất vì: {top_criterion}`;

async function explainMatch(profile, job) {
  try {
    const breakdown = job.breakdown || job.score_breakdown || {};
    const topCriterion = Object.entries(breakdown)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'kỹ năng';

    const criterionNameMap = {
      job_priority: 'ưu tiên công việc',
      experience: 'kinh nghiệm làm việc',
      devices: 'thiết bị sẵn có',
      career_goal: 'mục tiêu nghề nghiệp',
      hard_skills: 'kỹ năng chuyên môn',
      soft_skills: 'kỹ năng mềm',
      certificates: 'chứng chỉ',
    };

    const prompt = EXPLAIN_PROMPT
      .replace('{breakdown}', JSON.stringify(breakdown))
      .replace('{job_title}', job.title)
      .replace('{company}', job.company_name || 'công ty')
      .replace('{top_criterion}', criterionNameMap[topCriterion] || topCriterion);

    const raw = await callLLM(prompt, 'Explain in 25 words max', { temperature: 0.3 });
    // Ensure ≤25 words
    const words = raw.trim().split(' ');
    if (words.length > 25) return words.slice(0, 25).join(' ') + '.';
    return raw.trim();
  } catch {
    return `Công việc phù hợp với kỹ năng và kinh nghiệm của bạn.`;
  }
}

module.exports = { explainMatch };
```

---

## 8. Cập nhật .env

```env
# ── Gemini (single key cho tất cả: STT + TTS + LLM + Embedding) ───────────────
GEMINI_API_KEY=your-key-here

# Model selection
GEMINI_LLM_MODEL=gemini-2.5-flash
GEMINI_STT_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-2.5-flash-tts
GEMINI_TTS_VOICE=Zephyr
GEMINI_EMBED_MODEL=text-embedding-004

# Scoring v2 defaults
MATCH_TOP_K_VOICE=3
MATCH_TOP_K_WEB=10
MATCH_DEFAULT_RADIUS_KM=10

# REMOVE THESE (không còn dùng):
# GROQ_API_KEY  ← xóa
```

---

## 9. Updated package.json dependencies

```bash
# Thêm / giữ
npm install @google/genai              # Gemini SDK mới nhất (có genai client)

# Xóa (không còn cần)
npm uninstall groq-sdk
```

---

## 10. Voice Fallback Strategy

```
Thứ tự ưu tiên khi STT/TTS lỗi:

STT Fallback chain:
  1. gemini-2.5-flash (batch inline) ← PRIMARY
  2. Web Speech API (browser, realtime) ← nếu batch timeout
  3. Text input fallback (WCAG 2.2 requirement) ← luôn available

TTS Fallback chain:
  1. gemini-2.5-flash-tts ← PRIMARY
  2. gemini-3.1-flash-tts-preview ← nếu cần streaming
  3. Browser SpeechSynthesis API ← client-side fallback (free)
  4. Text display only ← accessibility fallback
```

---

## 11. Lý do chọn Gemini thay Groq Whisper

| Tiêu chí | Groq Whisper | Gemini 2.5 Flash |
|---|---|---|
| Tiếng Việt accuracy | ~85% | ~92% |
| Kỹ năng tiềm ẩn detection | ❌ (chỉ STT) | ✅ (hiểu ngữ nghĩa) |
| Xử lý accent miền Nam/Bắc | Trung bình | Tốt hơn |
| API key riêng | Cần Groq key | Chỉ cần Gemini key |
| Cost | $0.1/hr audio | Free tier 500 RPD |
| Latency | ~300ms | ~600ms (batch) / <300ms (Live) |
| Context-aware | ❌ | ✅ (biết đang là voice onboarding) |

**Kết luận:** Gemini 2.5 Flash STT không chỉ transcribe — nó còn *hiểu* người dùng đang nói gì trong context voice onboarding, giúp intake agent hoạt động tốt hơn nhiều.
