import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import { logger } from '../../../packages/logger/index.js';
import { GOOGLE_CLOUD_PROJECT } from '../../env/index.js';
import { transcribeWithGroq } from './groq.stt.js';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const FILLER = /\b(ừm+|à+|ờ+|uh+|um+)\b/gi;
const REPEAT = /\b(\w+)( \1)+\b/gi;

// Map a browser MIME type to the app's STT encoding enum — shared by the GCP and Groq paths.
const encodingFromMime = (mimeType = '') => {
  if (mimeType.includes('wav')) return 'LINEAR16';
  if (mimeType.includes('mp3')) return 'MP3';
  if (mimeType.includes('ogg')) return 'OGG_OPUS';
  return 'WEBM_OPUS';
};

const transcribeGcp = async (audioBase64, mimeType) => {
  const encoding = encodingFromMime(mimeType);
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
        'x-goog-user-project': GOOGLE_CLOUD_PROJECT || 'bdien-muonmay'
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

  // Fallback to the shared Groq Whisper implementation (single source of truth: groq.stt.js).
  const buf = Buffer.from(audioBase64, 'base64');
  const { transcript } = await transcribeWithGroq(buf, {
    encoding: encodingFromMime(mimeType),
    languageCode: 'vi-VN',
  });
  return String(transcript || '').replace(FILLER, '').replace(REPEAT, '$1').trim();
};
