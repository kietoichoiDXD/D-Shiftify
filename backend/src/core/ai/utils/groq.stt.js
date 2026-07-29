/* global fetch, FormData, Blob */
/**
 * Groq Whisper STT — drop-in Vietnamese speech-to-text that needs no Google billing.
 *
 * Uses Groq's OpenAI-compatible audio transcription endpoint (whisper-large-v3 / -turbo).
 * No training/fine-tuning. Returns a transcript plus optional segment-level confidence.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const GROQ_STT_MODEL = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo';

// Maps the app's encoding enum to a filename + MIME Groq accepts (flac, mp3, mp4, mpeg,
// mpga, m4a, ogg, wav, webm). Whisper sniffs the container, so the extension matters.
const ENCODING_FILE = {
    WEBM_OPUS: { name: 'audio.webm', type: 'audio/webm' },
    OGG_OPUS: { name: 'audio.ogg', type: 'audio/ogg' },
    LINEAR16: { name: 'audio.wav', type: 'audio/wav' },
    FLAC: { name: 'audio.flac', type: 'audio/flac' },
    MP3: { name: 'audio.mp3', type: 'audio/mpeg' },
    MULAW: { name: 'audio.wav', type: 'audio/wav' },
    AMR: { name: 'audio.amr', type: 'audio/amr' },
    AMR_WB: { name: 'audio.amr', type: 'audio/amr' },
};

export const isGroqSttConfigured = () =>
    Boolean(process.env.GROQ_API_KEY) && process.env.GROQ_API_KEY !== 'gsk_placeholder';

/**
 * @param {Buffer} buffer raw audio bytes
 * @param {{ encoding?: string, languageCode?: string }} options
 * @returns {Promise<{transcript: string, confidence: number|null, languageCode: string}>}
 */
export const transcribeWithGroq = async (buffer, { encoding = 'WEBM_OPUS', languageCode = 'vi-VN' } = {}) => {
    const file = ENCODING_FILE[String(encoding).toUpperCase()] || ENCODING_FILE.WEBM_OPUS;
    const language = String(languageCode).split('-')[0] || 'vi';

    const form = new FormData();
    form.append('file', new Blob([buffer], { type: file.type }), file.name);
    form.append('model', GROQ_STT_MODEL);
    form.append('language', language);
    // verbose_json exposes per-segment avg_logprob so we can derive a coarse confidence.
    form.append('response_format', 'verbose_json');
    form.append('temperature', '0');

    const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body: form,
    });

    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`Groq STT failed (${response.status}): ${detail.slice(0, 200)}`);
    }

    const data = await response.json();
    const transcript = String(data.text || '').trim();

    // avg_logprob is negative; map to a 0-1 confidence so the client can flag low-quality input.
    const segments = Array.isArray(data.segments) ? data.segments : [];
    const logProbs = segments.map(s => Number(s.avg_logprob)).filter(Number.isFinite);
    const confidence = logProbs.length
        ? Math.max(0, Math.min(1, Math.exp(logProbs.reduce((a, b) => a + b, 0) / logProbs.length)))
        : null;

    return { transcript, confidence, languageCode };
};
