import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { getUserContext } from 'packages/authModel/module/user';
import { VoiceService } from 'core/modules/voice/services/voice.service';

const userIdOf = req => getUserContext(req).payload.id;
const toInt = (v, d) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : d;
};

class Controller {
    constructor() {
        this.service = VoiceService;
    }

    stt = async req => {
        const data = await this.service.transcribe({
            audioUrl: req.body.audio_url,
            audioBase64: req.body.audio_base64 || req.body.audioBase64,
            encoding: req.body.encoding,
            source: req.body.source,
            referenceId: req.body.reference_id,
            language: req.body.language,
            userId: userIdOf(req),
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    tts = async req => {
        const data = await this.service.synthesize({
            text: req.body.text,
            source: req.body.source,
            referenceId: req.body.reference_id,
            voice: req.body.voice,
            userId: userIdOf(req),
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    createLog = async req => {
        const data = await this.service.createLog({
            userId: req.body.user_id || userIdOf(req),
            type: req.body.type,
            source: req.body.source,
            referenceId: req.body.reference_id,
            status: req.body.status,
        });
        return ValidHttpResponse.toCreatedResponse(data);
    };

    listLogs = async req => {
        const data = await this.service.listLogs({
            type: req.query.type,
            source: req.query.source,
            status: req.query.status,
            userId: req.query.user_id,
            page: toInt(req.query.page, 1),
            size: toInt(req.query.limit, 20),
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    summary = async req => {
        const data = await this.service.summary({
            from: req.query.from,
            to: req.query.to,
            userId: req.query.user_id,
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    getLog = async req => {
        const data = await this.service.getLog(req.params.voice_log_id);
        return ValidHttpResponse.toOkResponse(data);
    };

    updateStatus = async req => {
        const data = await this.service.updateStatus(req.params.voice_log_id, req.body.status);
        return ValidHttpResponse.toOkResponse(data);
    };

    deleteLog = async req => {
        const data = await this.service.deleteLog(req.params.voice_log_id);
        return ValidHttpResponse.toOkResponse(data);
    };

    sttBatch = async req => {
        const data = await this.service.sttBatch({ items: req.body.items, userId: userIdOf(req) });
        return ValidHttpResponse.toCreatedResponse(data);
    };

    ttsPreview = async req => {
        const data = await this.service.ttsPreview({
            text: req.body.text,
            voice: req.body.voice,
            speed: req.body.speed,
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    retry = async req => {
        const data = await this.service.retry(req.params.id, userIdOf(req));
        return ValidHttpResponse.toOkResponse(data);
    };
}

export const VoiceController = new Controller();
