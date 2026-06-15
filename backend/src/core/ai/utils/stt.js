import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import Groq from 'groq-sdk';
import { logger } from '../../../packages/logger/index.js';


let groq;
const getGroqClient = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is missing");
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const FILLER = /\b(ừm+|à+|ờ+|uh+|um+)\b/gi;
const REPEAT = /\b(\w+)( \1)+\b/gi;

const transcribeGcp = async (audioBase64, mimeType) => {
  let encoding = 'WEBM_OPUS';
  if (mimeType.includes('wav')) encoding = 'LINEAR16';
  else if (mimeType.includes('mp3')) encoding = 'MP3';
  else if (mimeType.includes('ogg')) encoding = 'OGG_OPUS';

  const token = await auth.getAccessToken();
  const payload = {
    config: {
      encoding,
      sampleRateHertz: 48000,
      languageCode: 'vi-VN'
    },
    audio: {
      content: audioBase64
    }
  };

  const res = await axios.post(
    'https://speech.googleapis.com/v1/speech:recognize',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-goog-user-project': 'bdien-muonmay'
      }
    }
  );

  if (res.data && res.data.results && res.data.results.length > 0) {
    return res.data.results[0].alternatives[0].transcript;
  }
  return '';
};

export const transcribeAudio = async (audioBase64, mimeType = 'audio/webm') => {
  try {
    logger.info(`[STT] Attempting Google Cloud Speech-to-Text transcription...`);
    const transcript = await transcribeGcp(audioBase64, mimeType);
    if (transcript) {
      logger.info(`[STT] Google Cloud STT Success: "${transcript}"`);
      return transcript.replace(FILLER, '').replace(REPEAT, '$1').trim();
    }
  } catch (error) {
    logger.warn(`[STT] Google Cloud STT failed, falling back to Groq Whisper: ${error.message}`);
  }

  // Fallback to Groq Whisper
  const buf = Buffer.from(audioBase64, 'base64');
  const file = new File([buf], 'audio.webm', { type: mimeType });
  const res = await getGroqClient().audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo',
    language: 'vi',
    response_format: 'text',
  });
  return res.replace(FILLER, '').replace(REPEAT, '$1').trim();
};
