import { MessagesRepository, ParticipantsRepository, ConversationsRepository } from '../repositories/index.js';
import {CreateMessageDto } from '../dto/index.js';
import { MESSAGE } from './message.enum.js';

class Service {
    constructor() {
        this.messageRepository = MessagesRepository;
        this.participantRepository = ParticipantsRepository;
        this.conversationRepository = ConversationsRepository;
    }

    async createMessage(payload, senderId) {
        const participant = await this.participantRepository.findParticipant(
            payload.conversationId,
            senderId
        );

        if (!participant) {
            throw new Error(MESSAGE.FORBIDDEN);
        }

        const data = CreateMessageDto(payload);

        const message = await this.messageRepository.create({
            ...data,
            conversation_id: payload.conversationId,
            sender_id: senderId,
        });

        await this.conversationRepository.update(
            payload.conversationId,
            {}
        );
        const sender = await this.getSenderInfo(senderId);

        return {...message,sender,};    
    }

    async getMessages(conversationId, userId) {
        const participant = await this.participantRepository.findParticipant(
            conversationId,
            userId
        );

        if (!participant) {
            throw new Error(MESSAGE.FORBIDDEN);
        }

        const messages = await this.messageRepository.findAllByConversationId(conversationId);

        return messages;
    }
    async getSenderInfo(userId) {
        const user = await this.participantRepository.getNameByUserId(userId);

        return {
            name: user.fullName || user.companyName,
        };
    }
}

export const MessageService = new Service();