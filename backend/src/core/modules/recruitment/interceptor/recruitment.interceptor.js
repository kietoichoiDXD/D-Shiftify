import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import { ApplyJobSchema, CreateJobSchema, JobFilterSchema, UpdateApplicationStatusSchema, UpdateJobSchema } from '../dto';

export const CreateJobInterceptor = new ZodValidatorInterceptor(CreateJobSchema, 'body');

export const ApplyJobInterceptor = new ZodValidatorInterceptor(ApplyJobSchema, 'body');

export const JobFilterInterceptor = new ZodValidatorInterceptor(JobFilterSchema, 'query');

export const UpdateApplicationStatusInterceptor = new ZodValidatorInterceptor(UpdateApplicationStatusSchema, 'body');

export const UpdateJobInterceptor = new ZodValidatorInterceptor(UpdateJobSchema, 'body');
