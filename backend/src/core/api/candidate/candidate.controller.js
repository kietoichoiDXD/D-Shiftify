import { SkillProfileRepository } from '../../modules/ai/repositories/skill.profile.repository.js';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response.js';

class Controller {
  /** GET /api/candidate/profile?session_id=xxx */
  getProfile = async (req) => {
    const sessionId = req.query.session_id || req.user?.id;
    if (!sessionId) throw new Error('session_id required');
    const profile = await SkillProfileRepository.findByUserId(sessionId);
    if (!profile) throw new Error('Profile not found');
    return ValidHttpResponse.toOkResponse(profile);
  };
}

export const CandidateController = new Controller();
