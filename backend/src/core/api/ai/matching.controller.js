import { getUserContext } from 'packages/authModel/module/user';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { MatchingService } from 'core/modules/ai/matching/matching.service';

class MatchingControllerClass {
    getCriteria = async () => ValidHttpResponse.toOkResponse({
        status: 'success',
        data: MatchingService.getCriteria(),
    });

    matchJobs = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await MatchingService.matchCvToJobs(req.body, userId);
        return ValidHttpResponse.toOkResponse({ status: 'success', data });
    };
}

export const MatchingController = new MatchingControllerClass();
