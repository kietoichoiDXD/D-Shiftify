import { ConversationsRepository, ParticipantsRepository } from '../repositories/index.js';
import { BadRequestException, ForbiddenException, NotFoundException } from 'packages/httpException';
import { logger } from '../../../../packages/logger';
import { MESSAGE } from './message.enum.js';
import { JobRepository } from '../../job/repository/index';
import { CVRepository } from '../../cv/repository/cv.repository.js';
class Service {
    constructor() {
        this.conversationRepository = ConversationsRepository;
        this.participantRepository = ParticipantsRepository;
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
            const candidate =await this.cvRepository.findCandidateUserIdByCvId(application.cv_id,trx,);

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

    async getUserConversations(userId) {
        try {
            return await this.conversationRepository.findAllByUserId(userId);

        } catch (error) {
            this.logger.error(error.message);
            throw error;
        }
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

            const participants = await this.participantRepository.findAllByConversationId(conversationId);

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