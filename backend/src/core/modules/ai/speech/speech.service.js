import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import connection from 'core/database';
import { BadRequestException } from 'packages/httpException';
import {
    GOOGLE_CLOUD_PROJECT,
    GOOGLE_SPEECH_LANGUAGE,
    GOOGLE_TTS_GENDER,
    GOOGLE_TTS_VOICE,
    SPEECH_MAX_AUDIO_BYTES,
    SPEECH_MAX_TEXT_LENGTH,
} from 'core/env';

const ENCODINGS = new Set([
    'WEBM_OPUS', 'OGG_OPUS', 'LINEAR16', 'FLAC', 'MULAW', 'MP3', 'AMR', 'AMR_WB',
]);
const GENDERS = new Set(['MALE', 'FEMALE', 'NEUTRAL']);

const audioBufferFromBase64 = value => {
    const normalized = String(value || '').replace(/^data:audio\/[a-z0-9.+-]+;base64,/i, '');
    if (!normalized || !/^[a-z0-9+/=\r\n]+$/i.test(normalized)) {
        throw new BadRequestException('Audio must be a valid base64 string');
    }
    const buffer = Buffer.from(normalized, 'base64');
    if (!buffer.length) throw new BadRequestException('Audio is empty');
    if (buffer.length > SPEECH_MAX_AUDIO_BYTES) {
        throw new BadRequestException(`Audio exceeds the ${SPEECH_MAX_AUDIO_BYTES} byte limit`);
    }
    return buffer;
};

class SpeechServiceClass {
    constructor() {
        this.speechClient = null;
        this.ttsClient = null;
    }

    getSpeechClient() {
        if (!this.speechClient) {
            this.speechClient = new speech.SpeechClient({ projectId: GOOGLE_CLOUD_PROJECT });
        }
        return this.speechClient;
    }

    getTextToSpeechClient() {
        if (!this.ttsClient) {
            this.ttsClient = new textToSpeech.TextToSpeechClient({ projectId: GOOGLE_CLOUD_PROJECT });
        }
        return this.ttsClient;
    }

    async logUsage(userId, type, source, status) {
        try {
            await connection('voice_logs').insert({
                user_id: userId,
                type,
                source,
                status,
            });
        } catch (error) {
            return null;
        }
        return true;
    }

    async transcribe(input, userId) {
        const audio = audioBufferFromBase64(input.audioBase64);
        const encoding = String(input.encoding || 'WEBM_OPUS').toUpperCase();
        if (!ENCODINGS.has(encoding)) throw new BadRequestException('Unsupported audio encoding');

        const languageCode = input.languageCode || GOOGLE_SPEECH_LANGUAGE;
        const config = {
            encoding,
            languageCode,
            enableAutomaticPunctuation: true,
            model: input.model || 'latest_long',
        };
        if (input.sampleRateHertz) config.sampleRateHertz = input.sampleRateHertz;

        try {
            const [response] = await this.getSpeechClient().recognize({
                config,
                audio: { content: audio.toString('base64') },
            });
            const alternatives = (response.results || [])
                .map(result => result.alternatives && result.alternatives[0])
                .filter(Boolean);
            const transcript = alternatives.map(item => item.transcript).join(' ').trim();
            const confidenceValues = alternatives
                .map(item => Number(item.confidence))
                .filter(value => Number.isFinite(value) && value > 0);
            const confidence = confidenceValues.length
                ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
                : null;
            await this.logUsage(userId, 'speech_to_text', languageCode, 'success');
            return { transcript, confidence, languageCode };
        } catch (error) {
            await this.logUsage(userId, 'speech_to_text', languageCode, 'failed');
            throw error;
        }
    }

    async synthesize(input, userId) {
        const text = String(input.text || '').trim();
        if (!text) throw new BadRequestException('Text is required');
        if (text.length > SPEECH_MAX_TEXT_LENGTH) {
            throw new BadRequestException(`Text exceeds the ${SPEECH_MAX_TEXT_LENGTH} character limit`);
        }

        const languageCode = input.languageCode || GOOGLE_SPEECH_LANGUAGE;
        const gender = String(input.gender || GOOGLE_TTS_GENDER).toUpperCase();
        if (!GENDERS.has(gender)) throw new BadRequestException('Unsupported voice gender');
        const voice = { languageCode, ssmlGender: gender };
        const voiceName = input.voiceName || GOOGLE_TTS_VOICE;
        if (voiceName) voice.name = voiceName;

        try {
            const [response] = await this.getTextToSpeechClient().synthesizeSpeech({
                input: { text },
                voice,
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: input.speakingRate || 1,
                    pitch: input.pitch || 0,
                },
            });
            const content = Buffer.isBuffer(response.audioContent)
                ? response.audioContent
                : Buffer.from(response.audioContent || '');
            await this.logUsage(userId, 'text_to_speech', languageCode, 'success');
            return {
                audioBase64: content.toString('base64'),
                mimeType: 'audio/mpeg',
                languageCode,
                characterCount: text.length,
            };
        } catch (error) {
            await this.logUsage(userId, 'text_to_speech', languageCode, 'failed');
            throw error;
        }
    }
}

export const SpeechService = new SpeechServiceClass();
