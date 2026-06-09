import {
    CreateMessageDto,
    CreateRoomSchema,
    MessageHistoryQuerySchema,
    SendMessageSchema,
} from '../../src/core/modules/chat/dto';

describe('Chat API and socket contract', () => {
    it('validates room creation and message history pagination', () => {
        expect(CreateRoomSchema.parse({
            jobId: '4b07280f-fd5f-4694-b85c-2fbdc8486c3d',
            candidateId: 123,
        })).toMatchObject({ candidateId: 123 });

        expect(MessageHistoryQuerySchema.parse({})).toEqual({ limit: 50, offset: 0 });
    });

    it('maps socket message payloads to persisted chat rows', () => {
        const payload = SendMessageSchema.parse({
            roomId: '4b07280f-fd5f-4694-b85c-2fbdc8486c3d',
            content: 'Xin chao',
        });

        expect(CreateMessageDto(payload, 'user-1')).toEqual({
            room_id: payload.roomId,
            sender_id: 'user-1',
            content: 'Xin chao',
        });
    });
});
