import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import { CreateClassSchema } from '../dto/create-class.dto';

export const CreateClassInterceptor = new ZodValidatorInterceptor(CreateClassSchema);
