import { getUserContext } from 'packages/authModel/module/user';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { TrainingService } from 'core/modules/training/training.service';

const uid = req => getUserContext(req).payload.id;

class TrainingControllerClass {

    getMine = async req => ValidHttpResponse.toOkResponse({ status: 'success', data: await TrainingService.getMine(uid(req)) });
    upsertMine = async req => ValidHttpResponse.toOkResponse({ status: 'success', data: await TrainingService.upsertMine(uid(req), req.body) });
    createCourse = async req => ValidHttpResponse.toCreatedResponse({ status: 'success', data: await TrainingService.createCourse(uid(req), req.body) });

    register = async req => ValidHttpResponse.toCreatedResponse(await TrainingService.register(uid(req), req.body));
    patchMine = async req => ValidHttpResponse.toOkResponse({ status: 'success', message: 'Cập nhật hồ sơ thành công', data: await TrainingService.upsertMine(uid(req), req.body) });
    deleteMine = async req => ValidHttpResponse.toOkResponse(await TrainingService.deleteMine(uid(req)));
    listCenters = async req => ValidHttpResponse.toOkResponse(await TrainingService.listCenters({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 }));
    getCenterById = async req => ValidHttpResponse.toOkResponse(await TrainingService.getCenterById(req.params.training_center_id));

    listMyCourses = async req => ValidHttpResponse.toOkResponse(await TrainingService.listMyCourses(uid(req)));
    createMyCourse = async req => ValidHttpResponse.toCreatedResponse({ status: 'success', data: await TrainingService.createCourse(uid(req), req.body) });

    listCourses = async req => ValidHttpResponse.toOkResponse(await TrainingService.listCourses({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20, centerId: req.query.center_id }));
    getCourse = async req => ValidHttpResponse.toOkResponse(await TrainingService.getCourse(req.params.course_id));
    updateCourse = async req => ValidHttpResponse.toOkResponse(await TrainingService.updateCourse(uid(req), req.params.course_id, req.body));
    deleteCourse = async req => ValidHttpResponse.toOkResponse(await TrainingService.deleteCourse(uid(req), req.params.course_id));

    listCourseSkills = async req => ValidHttpResponse.toOkResponse(await TrainingService.listCourseSkills(req.params.course_id));
    addCourseSkills = async req => ValidHttpResponse.toCreatedResponse(await TrainingService.addCourseSkills(uid(req), req.params.course_id, req.body.skills));
    removeCourseSkill = async req => ValidHttpResponse.toOkResponse(await TrainingService.removeCourseSkill(uid(req), req.params.course_id, req.params.skill_id));
}

export const TrainingController = new TrainingControllerClass();
