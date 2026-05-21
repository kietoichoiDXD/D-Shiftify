import { createClient } from 'redis';
import { z } from 'zod';
import { routerModel } from '../agents/shared/llm.js';
import { segment, isAvailable as vncoreAvailable } from './vncorenlp.client.js';

const MODEL_ID  = process.env.PHOBERT_MODEL || 'Xenova/bert-base-multilingual-cased-ner-hrl';
const CACHE_TTL = 300;

let redis = null;
const getRedis = async () => {
  if (!redis && process.env.REDIS_URL) {
    redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect().catch(() => { redis = null; });
  }
  return redis;
};

const cacheKey = (text) => `ner:${Buffer.from(text).toString('base64').slice(0, 64)}`;

let _pipeline = null;
const getPipeline = async () => {
  if (_pipeline) return _pipeline;
  try {
    const { pipeline } = await import('@xenova/transformers');
    _pipeline = await pipeline('token-classification', MODEL_ID, { aggregation_strategy: 'simple' });
    return _pipeline;
  } catch { return null; }
};

const LABEL_MAP = {
  'B-SKILL': 'SKILL', 'I-SKILL': 'SKILL', 'B-EXP': 'EXP', 'I-EXP': 'EXP',
  'B-EDU': 'EDU', 'I-EDU': 'EDU', 'B-AT': 'AT_TOOL', 'I-AT': 'AT_TOOL',
  'B-MISC': 'SKILL', 'I-MISC': 'SKILL', 'B-ORG': 'EXP', 'I-ORG': 'EXP',
};

const runPhoBERT = async (text) => {
  const pipe = await getPipeline();
  if (!pipe) return null;
  const tokens = await pipe(text);
  const result = { SKILL: [], EXP: [], EDU: [], AT_TOOL: [] };
  for (const tok of tokens) {
    const type = LABEL_MAP[tok.entity_group] || LABEL_MAP[tok.entity];
    if (type && tok.word?.trim()) result[type].push(tok.word.trim());
  }
  return result;
};

const NERSchema = z.object({ SKILL: z.array(z.string()), EXP: z.array(z.string()), EDU: z.array(z.string()), AT_TOOL: z.array(z.string()) });
const geminiNER = routerModel.withStructuredOutput(NERSchema);

const runGeminiFallback = (text) => geminiNER.invoke(
  `Trích xuất thực thể từ văn bản của người tìm việc khiếm thị tại Việt Nam.\n\n"${text}"\n\n` +
  `SKILL: kỹ năng chuyên môn và công nghệ. EXP: kinh nghiệm làm việc. EDU: học vấn, chứng chỉ. AT_TOOL: công cụ hỗ trợ (NVDA, JAWS, Braille...).`,
);

export const runNER = async (text) => {
  if (!text?.trim()) return { SKILL: [], EXP: [], EDU: [], AT_TOOL: [] };

  const r = await getRedis();
  const key = cacheKey(text);
  if (r) { const cached = await r.get(key).catch(() => null); if (cached) return JSON.parse(cached); }

  let processedText = text;
  if (await vncoreAvailable()) processedText = await segment(text).catch(() => text);

  const result = (await runPhoBERT(processedText)) || (await runGeminiFallback(processedText));

  if (r) await r.setEx(key, CACHE_TTL, JSON.stringify(result)).catch(() => {});
  return result;
};
