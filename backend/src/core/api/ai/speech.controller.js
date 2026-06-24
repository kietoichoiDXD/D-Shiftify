import { getUserContext } from 'packages/authModel/module/user';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { SpeechService } from 'core/modules/ai/speech/speech.service';

class SpeechControllerClass {
    transcribe = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await SpeechService.transcribe(req.body, userId);
        return ValidHttpResponse.toOkResponse({ status: 'success', data });
    };

    synthesize = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await SpeechService.synthesize(req.body, userId);
        return ValidHttpResponse.toOkResponse({ status: 'success', data });
    };
}

export const SpeechController = new SpeechControllerClass();
