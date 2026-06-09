import { getUserContext } from 'packages/authModel/module/user';
import { candidateService } from 'core/modules/candidate/candidate.service';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';

class Controller {
    getMine = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.getProfileByUserId(id);
        return ValidHttpResponse.toOkResponse(profile);
    };

    create = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.createProfile(id, req.body);
        return ValidHttpResponse.toCreatedResponse(profile);
    };

    update = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.updateProfile(id, req.body);
        return ValidHttpResponse.toOkResponse(profile);
    };

    addEducation = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.addEducation(id, req.body);
        return ValidHttpResponse.toCreatedResponse(profile);
    };

    updateEducation = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.updateEducation(id, req.params.educationId, req.body);
        return ValidHttpResponse.toOkResponse(profile);
    };

    deleteEducation = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.deleteEducation(id, req.params.educationId);
        return ValidHttpResponse.toOkResponse(profile);
    };

    addExperience = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.addExperience(id, req.body);
        return ValidHttpResponse.toCreatedResponse(profile);
    };

    updateExperience = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.updateExperience(id, req.params.experienceId, req.body);
        return ValidHttpResponse.toOkResponse(profile);
    };

    deleteExperience = async req => {
        const { id } = getUserContext(req);
        const profile = await candidateService.deleteExperience(id, req.params.experienceId);
        return ValidHttpResponse.toOkResponse(profile);
    };
}

export const CvController = new Controller();
