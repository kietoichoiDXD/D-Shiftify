import { z } from 'zod';

export const RoomIdParamSchema = z.object({
    roomId: z.string().trim().uuid(),
}).strict();

export const MessageHistoryQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
}).strict();

export const SendMessageSchema = z.object({
    roomId: z.string().trim().uuid(),
    content: z.string().trim().min(1).max(4000),
}).strict();

export const CreateMessageDto = (payload, senderId) => ({
    room_id: payload.roomId,
    sender_id: senderId,
    content: payload.content,
});

export const CreateRoomSchema = z.object({
    jobId: z.string().trim().uuid(),
    candidateId: z.coerce.number().int().positive().optional(),
}).strict();
