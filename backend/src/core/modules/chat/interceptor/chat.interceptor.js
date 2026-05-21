import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import { MessageHistoryQuerySchema, RoomIdParamSchema } from '../dto';

export const RoomIdParamInterceptor = new ZodValidatorInterceptor(RoomIdParamSchema, 'params');

export const MessageHistoryQueryInterceptor = new ZodValidatorInterceptor(MessageHistoryQuerySchema, 'query');
