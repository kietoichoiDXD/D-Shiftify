import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import { CreateRoomSchema, MessageHistoryQuerySchema, RoomIdParamSchema } from '../dto';

export const RoomIdParamInterceptor = new ZodValidatorInterceptor(RoomIdParamSchema, 'params');

export const MessageHistoryQueryInterceptor = new ZodValidatorInterceptor(MessageHistoryQuerySchema, 'query');

export const CreateRoomInterceptor = new ZodValidatorInterceptor(CreateRoomSchema, 'body');
