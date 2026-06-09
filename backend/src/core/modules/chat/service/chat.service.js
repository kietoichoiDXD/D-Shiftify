import { BadRequestException, ForbiddenException, NotFoundException } from 'packages/httpException';
import db from 'core/database';
import { CreateMessageDto } from '../dto';
import { ChatRepository } from '../repository';

class Service {
    constructor() {
        this.repository = ChatRepository;
    }

    getRooms(userId) {
        return this.repository.findRoomsByUser(userId);
    }

    async getOrCreateRoom(payload, user) {
        const { jobId, candidateId } = payload;

        const job = await db('job_descriptions').where({ job_id: jobId }).first();
        if (!job) {
            throw new NotFoundException('Job description not found');
        }

        const employerId = job.employer_user_id;
        if (!employerId) {
            throw new BadRequestException('This job does not have an employer associated with it');
        }

        let resolvedCandidateId;
        const isEmployer = user.roles.some(role => role === 'EMPLOYER');

        if (isEmployer) {
            if (user.id !== employerId) {
                throw new ForbiddenException('You are not the employer of this job');
            }
            if (!candidateId) {
                throw new BadRequestException('candidateId is required for employers');
            }
            resolvedCandidateId = candidateId;
        } else {
            resolvedCandidateId = user.id;
        }

        let room = await this.repository.findRoomByMembers(jobId, employerId, resolvedCandidateId);
        if (!room) {
            room = await this.repository.createRoom({
                job_id: jobId,
                employer_id: employerId,
                candidate_id: resolvedCandidateId,
            });
        }
        return room;
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
