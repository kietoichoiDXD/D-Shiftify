import { Module } from 'packages/handler/Module';
import { hasTrainingCenterRole } from 'core/modules/auth/guard/role.manager';
import { CreateCourseInterceptor, UpsertTrainingCenterInterceptor } from 'core/modules/training/training.interceptor';
import 'core/modules/training/training.dto';
import { TrainingController } from './training.controller';

export const TrainingResolver = Module.builder()
    .addPrefix({ prefixPath: '/training-center', tag: 'training-center', module: 'TrainingCenterModule' })
    .register([
        { route: '/me', method: 'get', controller: TrainingController.getMine, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/me', method: 'put', body: 'UpsertTrainingCenterDto', interceptors: [UpsertTrainingCenterInterceptor], controller: TrainingController.upsertMine, preAuthorization: true, guards: [hasTrainingCenterRole] },
        { route: '/courses', method: 'post', body: 'CreateCourseDto', interceptors: [CreateCourseInterceptor], controller: TrainingController.createCourse, preAuthorization: true, guards: [hasTrainingCenterRole] },
    ]);
