import { getUserContext } from 'packages/authModel/module/user';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { TrainingService } from 'core/modules/training/training.service';

class TrainingControllerClass {
    getMine = async req => ValidHttpResponse.toOkResponse({ status: 'success', data: await TrainingService.getMine(getUserContext(req).payload.id) });
    upsertMine = async req => ValidHttpResponse.toOkResponse({ status: 'success', data: await TrainingService.upsertMine(getUserContext(req).payload.id, req.body) });
    createCourse = async req => ValidHttpResponse.toCreatedResponse({ status: 'success', data: await TrainingService.createCourse(getUserContext(req).payload.id, req.body) });
}

export const TrainingController = new TrainingControllerClass();
