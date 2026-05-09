import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const FILLER = /\b(ừm+|à+|ờ+|uh+|um+)\b/gi;
const REPEAT = /\b(\w+)( \1)+\b/gi;

export const transcribeAudio = async (audioBase64, mimeType = 'audio/webm') => {
  const buf = Buffer.from(audioBase64, 'base64');
  const file = new File([buf], 'audio.webm', { type: mimeType });
  const res = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo',
    language: 'vi',
    response_format: 'text',
  });
  return res.replace(FILLER, '').replace(REPEAT, '$1').trim();
};
