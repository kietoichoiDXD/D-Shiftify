import { Module } from 'packages/handler/Module';
import { hasTrainingCenterRole } from 'core/modules/auth/guard/role.manager';
import { CreateCourseInterceptor, UpsertTrainingCenterInterceptor } from 'core/modules/training/training.interceptor';
import 'core/modules/training/training.dto';
import { TrainingController } from './training.controller';

export const TrainingCentersResolver = Module.builder()
    .addPrefix({ prefixPath: '/training-centers', tag: 'training-centers', module: 'TrainingCentersModule' })
    .register([
        { route: '/', method: 'post', body: 'UpsertTrainingCenterDto', interceptors: [UpsertTrainingCenterInterceptor], controller: TrainingController.register, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/me', method: 'get', controller: TrainingController.getMine, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/me', method: 'patch', body: 'UpsertTrainingCenterDto', interceptors: [UpsertTrainingCenterInterceptor], controller: TrainingController.patchMine, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/me', method: 'delete', controller: TrainingController.deleteMine, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/me/courses', method: 'get', controller: TrainingController.listMyCourses, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/me/courses', method: 'post', body: 'CreateCourseDto', interceptors: [CreateCourseInterceptor], controller: TrainingController.createMyCourse, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/', method: 'get', controller: TrainingController.listCenters, preAuthorization: true },
        { route: '/:training_center_id', method: 'get', controller: TrainingController.getCenterById, preAuthorization: true },
    ]);
