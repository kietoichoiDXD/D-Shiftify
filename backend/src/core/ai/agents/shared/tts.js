import axios from 'axios';

const CHUNK_SIZE = parseInt(process.env.TTS_CHUNK_SIZE || '200', 10);

const sanitize = (text) =>
  text
    .replace(/[*_`#>~]/g, '')
    .replace(/(\d+)%/g, (_, n) => `${n} phần trăm`)
    .replace(/[/$→]/g, ' ')
    .trim();

const splitChunks = (text) => {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > CHUNK_SIZE) { if (cur) chunks.push(cur.trim()); cur = s; }
    else cur += s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
};

const fetchGoogleChunk = async (chunk) => {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`;
  const res = await axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
  return Buffer.from(res.data);
};

/** FPT AI TTS fallback — higher quality Vietnamese voice */
const fetchFptChunk = async (chunk) => {
  const res = await axios.post(
    'https://api.fpt.ai/hmi/tts/v5',
    chunk,
    {
      responseType: 'arraybuffer',
      headers: {
        'api-key': process.env.FPT_AI_API_KEY,
        'speed': '',
        'voice': 'leminh', // natural male Vietnamese voice
        'Content-Type': 'application/json',
      },
    },
  );
  return Buffer.from(res.data);
};

/** text → base64 MP3 — tries Google first, falls back to FPT AI */
export const synthesizeSpeech = async (text) => {
  const clean = sanitize(text);
  const chunks = splitChunks(clean);

  const useFpt = !!process.env.FPT_AI_API_KEY;
  const fetchChunk = useFpt ? fetchFptChunk : fetchGoogleChunk;

  try {
    const buffers = await Promise.all(chunks.map(fetchChunk));
    return Buffer.concat(buffers).toString('base64');
  } catch {
    if (useFpt) {
      const buffers = await Promise.all(chunks.map(fetchGoogleChunk));
      return Buffer.concat(buffers).toString('base64');
    }
    throw new Error('TTS failed');
  }
};

/**
 * Stream TTS chunks as SSE to an Express response.
 * Each event: { index, total, audio_base64 } — client plays chunks in order.
 * Usage: GET /api/ai/voice/stream?text=...
 */
export const streamSpeech = async (text, res) => {
  const clean = sanitize(text);
  const chunks = splitChunks(clean);
  const useFpt = !!process.env.FPT_AI_API_KEY;
  const fetchChunk = useFpt ? fetchFptChunk : fetchGoogleChunk;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  for (let i = 0; i < chunks.length; i++) {
    try {
      const buf = await fetchChunk(chunks[i]).catch(() => fetchGoogleChunk(chunks[i]));
      const payload = JSON.stringify({ index: i, total: chunks.length, audio_base64: buf.toString('base64') });
      res.write(`data: ${payload}\n\n`);
    } catch {
      // skip failed chunk, don't break stream
    }
  }
  res.write('data: [DONE]\n\n');
  res.end();
};
