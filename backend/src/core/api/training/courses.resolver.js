import { Module } from 'packages/handler/Module';
import { hasTrainingCenterRole } from 'core/modules/auth/guard/role.manager';
import 'core/modules/training/training.dto';
import { TrainingController } from './training.controller';

export const CoursesResolver = Module.builder()
    .addPrefix({ prefixPath: '/courses', tag: 'courses', module: 'CoursesModule' })
    .register([
        { route: '/', method: 'get', controller: TrainingController.listCourses, preAuthorization: true },

        { route: '/:course_id/skills', method: 'get', controller: TrainingController.listCourseSkills, preAuthorization: true },
        { route: '/:course_id/skills', method: 'post', controller: TrainingController.addCourseSkills, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/:course_id/skills/:skill_id', method: 'delete', controller: TrainingController.removeCourseSkill, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/:course_id', method: 'get', controller: TrainingController.getCourse, preAuthorization: true },
        { route: '/:course_id', method: 'patch', controller: TrainingController.updateCourse, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/:course_id', method: 'delete', controller: TrainingController.deleteCourse, preAuthorization: true, guards: [hasTrainingCenterRole] },
    ]);
