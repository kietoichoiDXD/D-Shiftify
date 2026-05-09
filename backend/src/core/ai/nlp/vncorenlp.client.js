/**
 * VnCoreNLP REST Client
 * Wraps the Java VnCoreNLP server (docker run -p 9000:9000 vncorenlp/vncorenlp-server)
 *
 * Provides: word segmentation, POS tagging, dependency parsing
 * Critical for Vietnamese: "trình đọc màn hình" must stay as one token
 */
import axios from 'axios';

const BASE_URL = process.env.VNCORENLP_URL || 'http://localhost:9000';
const TIMEOUT  = 5000; // 5s — fallback to raw text if unavailable

const client = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });

/**
 * Annotate Vietnamese text.
 * @param {string} text
 * @param {string[]} annotators - default: ['wseg','pos','ner','parse']
 * @returns {Promise<{sentences: Array<Array<{wordForm, posTag, nerLabel, head, depLabel}>>}>}
 */
export const annotate = async (text, annotators = ['wseg', 'pos', 'ner']) => {
  const res = await client.post('/v1/annotate', {
    text,
    annotators: annotators.join(','),
  });
  return res.data; // { sentences: [[{wordForm, posTag, nerLabel, ...}]] }
};

/**
 * Word segmentation only — fastest, used for AT keyword matching.
 * "trình đọc màn hình" → "trình_đọc_màn_hình"
 * @param {string} text
 * @returns {Promise<string>} segmented text with underscores
 */
export const segment = async (text) => {
  const data = await annotate(text, ['wseg']);
  return data.sentences
    .map((sent) => sent.map((tok) => tok.wordForm).join(' '))
    .join(' ');
};

/**
 * Extract NER labels from annotation result.
 * @param {object} annotated - result from annotate()
 * @returns {{ SKILL: string[], EXP: string[], EDU: string[], AT_TOOL: string[] }}
 */
export const extractNER = (annotated) => {
  const result = { SKILL: [], EXP: [], EDU: [], AT_TOOL: [] };
  for (const sent of annotated.sentences || []) {
    let buf = [];
    let curLabel = null;
    for (const tok of sent) {
      const bio = tok.nerLabel || 'O';
      const [prefix, label] = bio.includes('-') ? bio.split('-') : ['O', null];
      if (prefix === 'B') {
        if (buf.length && curLabel) result[curLabel]?.push(buf.join(' '));
        buf = [tok.wordForm]; curLabel = label;
      } else if (prefix === 'I' && label === curLabel) {
        buf.push(tok.wordForm);
      } else {
        if (buf.length && curLabel) result[curLabel]?.push(buf.join(' '));
        buf = []; curLabel = null;
      }
    }
    if (buf.length && curLabel) result[curLabel]?.push(buf.join(' '));
  }
  return result;
};

/**
 * Health check — returns true if VnCoreNLP server is reachable.
 */
export const isAvailable = async () => {
  try {
    await client.get('/health', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};
