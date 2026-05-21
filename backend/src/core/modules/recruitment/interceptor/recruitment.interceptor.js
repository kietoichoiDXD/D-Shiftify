import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import { ApplyJobSchema, CreateJobSchema } from '../dto';

export const CreateJobInterceptor = new ZodValidatorInterceptor(CreateJobSchema, 'body');

export const ApplyJobInterceptor = new ZodValidatorInterceptor(ApplyJobSchema, 'body');
