import { randomUUID } from 'crypto';
import { NotFoundException, BadRequestException } from 'packages/httpException';
import { VoiceLogRepository } from '../repositories/voice-log.repository';
import { SpeechService } from '../../ai/speech/speech.service';

const fetchAudioBase64 = async url => {
    if (!/^https?:\/\//i.test(url)) throw new BadRequestException('audio_url must be http(s)');
    const res = await fetch(url);
    if (!res.ok) throw new BadRequestException(`Cannot fetch audio_url (${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.toString('base64');
};

const iso = v => (v instanceof Date ? v.toISOString() : v ?? null);

const presentLog = row => ({
    voice_log_id: row.id,
    user_id: row.userId,
    type: row.type,
    source: row.source,
    reference_id: row.referenceId,
    status: row.status,
    created_at: iso(row.createdAt),
});

class Service {
    constructor() {
        this.repository = VoiceLogRepository;
    }

    async transcribe({ audioUrl, audioBase64, encoding, source = null, referenceId = null, language = 'vi-VN', userId }) {
        if (!audioBase64 && !audioUrl) throw new BadRequestException('audio_url hoặc audio_base64 là bắt buộc');

        const log = await this.repository.createOne({
            user_id: userId, type: 'stt', source, reference_id: referenceId, status: 'processing',
        });

        try {
            const base64 = audioBase64 || (await fetchAudioBase64(audioUrl));
            const result = await SpeechService.transcribe(
                { audioBase64: base64, encoding, languageCode: language },
                userId,
            );
            await this.repository.updateStatus(log.id, 'success');
            return {
                text: result.text || '',
                confidence: result.confidence ?? null,
                voice_log_id: log.id,
                status: 'success',
            };
        } catch (error) {
            await this.repository.updateStatus(log.id, 'failed');
            throw error;
        }
    }

    async synthesize({ text, source = null, referenceId = null, voice = 'female_vi', userId }) {
        if (!text) throw new BadRequestException('text là bắt buộc');

        const log = await this.repository.createOne({
            user_id: userId, type: 'tts', source, reference_id: referenceId, status: 'processing',
        });

        try {
            const result = await SpeechService.synthesize({ text }, userId);
            await this.repository.updateStatus(log.id, 'success');
            return {

                audio_url: null,
                audio_base64: result.audioBase64 || null,
                mime_type: result.mimeType || 'audio/mpeg',
                duration_sec: null,
                voice_log_id: log.id,
                status: 'success',
            };
        } catch (error) {
            await this.repository.updateStatus(log.id, 'failed');
            throw error;
        }
    }

    async createLog({ userId, type, source = null, referenceId = null, status = 'success' }) {
        if (!type) throw new BadRequestException('type là bắt buộc');
        const log = await this.repository.createOne({
            user_id: userId,
            type,
            source,
            reference_id: referenceId,
            status,
        });
        return {
            voice_log_id: log.id,
            created_at: iso(log.createdAt),
            message: 'Tao voice log thanh cong',
        };
    }

    async listLogs({ type, source, status, userId, page = 1, size = 20 }) {
        const [rows, total] = await Promise.all([
            this.repository.list({ type, source, status, userId, page, size }),
            this.repository.total({ type, source, status, userId }),
        ]);
        return { total, page, limit: size, data: rows.map(presentLog) };
    }

    async getLog(id) {
        const log = await this.repository.findById(id);
        if (!log) throw new NotFoundException('Không tìm thấy voice log');
        return presentLog(log);
    }

    async updateStatus(id, status) {
        if (!status) throw new BadRequestException('status là bắt buộc');
        const log = await this.repository.findById(id);
        if (!log) throw new NotFoundException('Không tìm thấy voice log');
        const updated = await this.repository.updateStatus(id, status);
        return {
            status: 'success',
            message: 'Cap nhat trang thai voice log thanh cong',
            updated_at: iso(updated.updatedAt),
        };
    }

    async deleteLog(id) {
        const log = await this.repository.findById(id);
        if (!log) throw new NotFoundException('Không tìm thấy voice log');
        await this.repository.deleteById(id);
        return {
            status: 'success',
            message: 'Da xoa voice log',
            deleted_at: new Date().toISOString(),
        };
    }

    async summary({ from, to, userId }) {
        const s = await this.repository.summary({ from, to, userId });
        const successRate = s.total ? Math.round((s.success / s.total) * 1000) / 10 : 0;
        return {
            total_requests: s.total,
            success: s.success,
            failed: s.failed,
            success_rate: successRate,
            data: s.daily,
        };
    }

    async sttBatch({ items = [], userId }) {
        if (!items.length) throw new BadRequestException('items là bắt buộc');

        await Promise.all(
            items.map(it =>
                this.repository.createOne({
                    user_id: userId,
                    type: 'stt',
                    source: it.source || null,
                    reference_id: it.referenceId || it.reference_id || null,
                    status: 'processing',
                })
            )
        );
        return { job_id: randomUUID(), queued: items.length, status: 'processing' };
    }

    async ttsPreview({ text }) {
        if (!text) throw new BadRequestException('text là bắt buộc');

        return {
            preview_url: null,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };
    }

    async retry(id, userId) {
        const log = await this.repository.findById(id);
        if (!log) throw new NotFoundException('Không tìm thấy voice log');
        await this.repository.updateStatus(id, 'queued');

        return {
            status: 'queued',
            voice_log_id: id,
            message: 'Da dua yeu cau vao hang doi retry',
        };
    }
}

export const VoiceService = new Service();
