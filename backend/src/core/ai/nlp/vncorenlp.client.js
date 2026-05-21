import axios from 'axios';

const client = axios.create({ baseURL: process.env.VNCORENLP_URL || 'http://localhost:9000', timeout: 5000 });

export const annotate = async (text, annotators = ['wseg', 'pos', 'ner']) => {
  const res = await client.post('/v1/annotate', { text, annotators: annotators.join(',') });
  return res.data;
};

export const segment = async (text) => {
  const data = await annotate(text, ['wseg']);
  return data.sentences.map((sent) => sent.map((tok) => tok.wordForm).join(' ')).join(' ');
};

export const extractNER = (annotated) => {
  const result = { SKILL: [], EXP: [], EDU: [], AT_TOOL: [] };
  for (const sent of annotated.sentences || []) {
    let buf = [], curLabel = null;
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

export const isAvailable = async () => {
  try { await client.get('/health', { timeout: 2000 }); return true; }
  catch { return false; }
};
