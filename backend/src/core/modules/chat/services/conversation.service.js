import { ConversationsRepository, ParticipantsRepository, MessagesRepository } from '../repositories/index.js';
import { BadRequestException, ForbiddenException, NotFoundException } from 'packages/httpException';
import { logger } from '../../../../packages/logger';
import { MESSAGE } from './message.enum.js';
import { JobRepository } from '../../job/repository/index';
import { CVRepository } from '../../cv/repository/cv.repository.js';

class Service {
    constructor() {
        this.conversationRepository = ConversationsRepository;
        this.participantRepository = ParticipantsRepository;
        this.messageRepository = MessagesRepository;
        this.cvRepository = CVRepository;
        this.jobRepository = JobRepository;
        this.logger = logger;

    }

    async createConversationFromApplication(application, trx) {
        try {
            if (application.status !== 'accepted') {
                throw new BadRequestException(MESSAGE.APPLICATION_MUST_BE_ACCEPTED);
            }
            const recruiter = await this.jobRepository.findRecruiterUserIdByJobId(application.job_id,trx);

            if (!recruiter) {
                throw new NotFoundException(MESSAGE.RECRUITER_NOT_FOUND);
            }
            const candidate =await this.cvRepository.findCandidateUserIdByCvId(application.cv_id,trx);

            if (!candidate) {
                throw new NotFoundException(MESSAGE.CANDIDATE_NOT_FOUND);
            }

            const conversation = await this.conversationRepository.create({},trx);

            await this.participantRepository.create(
                {
                    conversation_id: conversation.id,
                    user_id: recruiter.recruiterUserId,
                },
                trx
            );

            await this.participantRepository.create(
                {
                    conversation_id: conversation.id,
                    user_id: candidate.candidateUserId,
                },
                trx
            );

            return conversation;

        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async getUserConversations(userId, { page = 1, limit = 20, search = '' } = {}) {
        try {
            const ids = await this.participantRepository.findConversationIdsByUserId(userId);

            const items = [];
            for (const conversationId of ids) {
                const conversation = await this.conversationRepository.findById(conversationId);
                if (conversation) {
                    const participants = await this.participantRepository.findDetailedByConversationId(conversationId);
                    const lastMessage = await this.messageRepository.getLastMessage(conversationId);
                    items.push({ ...conversation, participants, lastMessage });
                }
            }

            const term = search.trim().toLowerCase();
            const filtered = term
                ? items.filter(
                      it =>
                          it.participants.some(p => (p.fullName || '').toLowerCase().includes(term)) ||
                          (it.lastMessage?.content || '').toLowerCase().includes(term)
                  )
                : items;

            const start = (Math.max(1, page) - 1) * limit;
            return {
                total: filtered.length,
                items: filtered.slice(start, start + limit),
            };
        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async createConversation(creatorId, participantIds = []) {
        try {
            const uniqueIds = Array.from(new Set([creatorId, ...participantIds].filter(Boolean)));
            if (uniqueIds.length < 2) {
                throw new BadRequestException(MESSAGE.PARTICIPANTS_REQUIRED);
            }

            const conversation = await this.conversationRepository.create({});
            await this.participantRepository.createMany(
                uniqueIds.map(user_id => ({ conversation_id: conversation.id, user_id }))
            );

            const participants = await this.participantRepository.findAllByConversationId(conversation.id);
            return { ...conversation, participants };
        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async deleteConversation(conversationId, userId) {
        try {
            await this.#assertMember(conversationId, userId);
            await this.conversationRepository.deleteById(conversationId);
            return { message: MESSAGE.CONVERSATION_DELETED, deletedAt: new Date() };
        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async getParticipants(conversationId, userId) {
        try {
            await this.#assertMember(conversationId, userId);
            return await this.participantRepository.findAllByConversationId(conversationId);
        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async addParticipants(conversationId, userId, userIds = []) {
        try {
            await this.#assertMember(conversationId, userId);
            if (!userIds.length) {
                throw new BadRequestException(MESSAGE.PARTICIPANTS_REQUIRED);
            }
            await this.participantRepository.createMany(
                userIds.map(uid => ({ conversation_id: conversationId, user_id: uid }))
            );
            return {
                conversationId,
                addedUserIds: userIds,
                message: MESSAGE.PARTICIPANT_ADDED,
            };
        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async removeParticipant(conversationId, userId, targetUserId) {
        try {
            await this.#assertMember(conversationId, userId);
            if (!targetUserId) {
                throw new BadRequestException(MESSAGE.PARTICIPANTS_REQUIRED);
            }
            await this.participantRepository.removeParticipant(conversationId, targetUserId);
            return { message: MESSAGE.PARTICIPANT_REMOVED, deletedAt: new Date() };
        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async markRead(conversationId, userId, lastReadMessageId) {
        try {
            await this.#assertMember(conversationId, userId);

            let readAt = new Date();
            if (lastReadMessageId) {
                const msg = await this.messageRepository.findCreatedAtById(lastReadMessageId);
                if (msg?.createdAt) readAt = msg.createdAt;
            }

            await this.participantRepository.markReadAt(conversationId, userId, readAt);
            const unreadCount = await this.messageRepository.countUnread(conversationId, userId, readAt);

            return {
                conversationId,
                unreadCount,
                updatedAt: new Date(),
            };
        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }

    async #assertMember(conversationId, userId) {
        const participant = await this.participantRepository.findParticipant(conversationId, userId);
        if (!participant) {
            throw new ForbiddenException(MESSAGE.USER_NOT_IN_CONVERSATION);
        }
        return participant;
    }

    async getConversationById(conversationId, userId) {
        try {
            const participant = await this.participantRepository.findParticipant(conversationId,userId);

            if (!participant) {
                throw new ForbiddenException(
                    MESSAGE.USER_NOT_IN_CONVERSATION
                );
            }

            const conversation = await this.conversationRepository.findById(conversationId);

            if (!conversation) {
                throw new NotFoundException(MESSAGE.CONVERSATION_NOT_FOUND);
            }

            const participants = await this.participantRepository.findDetailedByConversationId(conversationId);

            return {
                ...conversation,
                participants,
            };

        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }
}

export const ConversationService = new Service();
