import { MessagesRepository, ParticipantsRepository, ConversationsRepository } from '../repositories/index.js';
import {CreateMessageDto } from '../dto/index.js';
import { MESSAGE } from './message.enum.js';
import { BadRequestException, ForbiddenException, NotFoundException } from 'packages/httpException';

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

    async getMessages(conversationId, userId, { cursor = null, limit = 30 } = {}) {
        const participant = await this.participantRepository.findParticipant(
            conversationId,
            userId
        );

        if (!participant) {
            throw new ForbiddenException(MESSAGE.FORBIDDEN);
        }

        let cursorCreatedAt = null;
        if (cursor) {
            const cursorMsg = await this.messageRepository.findCreatedAtById(cursor);
            cursorCreatedAt = cursorMsg?.createdAt || null;
        }

        const pageSize = Math.min(Math.max(1, Number(limit) || 30), 100);
        const messages = await this.messageRepository.findByCursor(conversationId, cursorCreatedAt, pageSize + 1);

        const hasMore = messages.length > pageSize;
        const page = hasMore ? messages.slice(0, pageSize) : messages;
        const nextCursor = hasMore ? page[page.length - 1].id : null;

        return { messages: page, nextCursor };
    }
    async getMessageById(messageId, userId) {
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new NotFoundException(MESSAGE.MESSAGE_NOT_FOUND);
        }
        const participant = await this.participantRepository.findParticipant(
            message.conversationId,
            userId
        );
        if (!participant) {
            throw new ForbiddenException(MESSAGE.USER_NOT_IN_CONVERSATION);
        }
        return message;
    }

    async updateMessage(messageId, userId, updateData) {
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new NotFoundException(MESSAGE.MESSAGE_NOT_FOUND);
        }
        if (message.senderId !== userId) {
            throw new ForbiddenException(MESSAGE.NOT_MESSAGE_OWNER);
        }
        if (!Object.keys(updateData).length) {
            throw new BadRequestException(MESSAGE.MESSAGE_CONTENT_REQUIRED);
        }
        return await this.messageRepository.update(messageId, updateData);
    }

    async deleteMessage(messageId, userId) {
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new NotFoundException(MESSAGE.MESSAGE_NOT_FOUND);
        }
        if (message.senderId !== userId) {
            throw new ForbiddenException(MESSAGE.NOT_MESSAGE_OWNER);
        }
        await this.messageRepository.softDelete(messageId);
        return { message: MESSAGE.MESSAGE_DELETED, deletedAt: new Date() };
    }

    async getSenderInfo(userId) {
        const user = await this.participantRepository.getNameByUserId(userId);

        return {
            name: user.fullName || user.companyName,
        };
    }
}

export const MessageService = new Service();
