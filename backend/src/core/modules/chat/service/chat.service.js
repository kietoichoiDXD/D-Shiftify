import { ForbiddenException, NotFoundException } from 'packages/httpException';
import { CreateMessageDto } from '../dto';
import { ChatRepository } from '../repository';

class Service {
    constructor() {
        this.repository = ChatRepository;
    }

    getRooms(userId) {
        return this.repository.findRoomsByUser(userId);
    }

    async getMessages(roomId, userId, pagination) {
        await this.ensureRoomMember(roomId, userId);
        return this.repository.findMessages(roomId, pagination.limit, pagination.offset);
    }

    async joinRoom(roomId, userId) {
        const room = await this.ensureRoomMember(roomId, userId);
        return room;
    }

    async sendMessage(payload, senderId) {
        await this.ensureRoomMember(payload.roomId, senderId);
        return this.repository.createMessage(CreateMessageDto(payload, senderId));
    }

    async ensureRoomMember(roomId, userId) {
        const room = await this.repository.findRoomForUser(roomId, userId);
        if (!room) {
            throw new ForbiddenException('You do not have access to this chat room');
        }
        return room;
    }

    async ensureRoomExists(roomId) {
        const room = await this.repository.findRoomById(roomId);
        if (!room) throw new NotFoundException('Chat room not found');
        return room;
    }
}

export const ChatService = new Service();
