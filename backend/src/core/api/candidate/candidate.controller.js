import { SkillProfileRepository } from '../../modules/ai/repositories/skill.profile.repository.js';
import { AccessibilityAlert } from '../../modules/ai/models/alert.model.js';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response.js';

class Controller {
  getProfile = async (req) => {
    const sessionId = req.query.session_id || req.user?.id;
    if (!sessionId) throw new Error('session_id required');
    const profile = await SkillProfileRepository.findByUserId(sessionId);
    if (!profile) throw new Error('Profile not found');
    return ValidHttpResponse.toOkResponse(profile);
  };

  getAlerts = async (req) => {
    const sessionId = req.query.session_id || req.user?.id;
    if (!sessionId) throw new Error('session_id required');
    const alerts = await AccessibilityAlert.find({ user_id: sessionId, read: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    await AccessibilityAlert.updateMany({ user_id: sessionId, read: false }, { $set: { read: true } });
    return ValidHttpResponse.toOkResponse(alerts);
  };
}

export const CandidateController = new Controller();
