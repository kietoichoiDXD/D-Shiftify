import { getUserContext } from 'packages/authModel/module/user';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { MatchingService } from 'core/modules/ai/matching/matching.service';

class MatchesControllerClass {
    suggestedJobs = async req => {
        const userId = getUserContext(req).payload.id;
        const limit = Number(req.query.limit) || 10;
        const data = await MatchingService.suggestJobsForUser(userId, { limit });
        return ValidHttpResponse.toOkResponse(data);
    };

    suggestedCandidates = async req => {
        const limit = Number(req.query.limit) || 10;
        const data = await MatchingService.suggestCandidatesForJob(req.params.job_id, { limit });
        return ValidHttpResponse.toOkResponse(data);
    };
}

export const MatchesController = new MatchesControllerClass();
