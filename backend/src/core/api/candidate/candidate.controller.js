import { SkillProfileRepository } from '../../modules/ai/repositories/skill.profile.repository.js';
import { AccessibilityAlert } from '../../modules/ai/models/alert.model.js';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response.js';
import { NotFoundException, UnAuthorizedException } from '../../../packages/httpException';
import { getUserContext } from '../../../packages/authModel/module/user';

class Controller {
  getProfile = async req => {
    const { id } = getUserContext(req);
    if (!id) throw new UnAuthorizedException('Authentication required');

    const profile = await SkillProfileRepository.findByUserId(id);
    if (!profile) throw new NotFoundException('Profile not found');

    return ValidHttpResponse.toOkResponse(profile);
  };

  getAlerts = async req => {
    const { id } = getUserContext(req);
    if (!id) throw new UnAuthorizedException('Authentication required');

    const alerts = await AccessibilityAlert.find({ user_id: id, read: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    await AccessibilityAlert.updateMany({ user_id: id, read: false }, { $set: { read: true } });

    return ValidHttpResponse.toOkResponse(alerts);
  };
}

export const CandidateController = new Controller();
