import db from 'core/database';

class Repository {
    findRoomsByUser(userId) {
        return db('chat_rooms')
            .leftJoin('job_descriptions', 'chat_rooms.job_id', 'job_descriptions.job_id')
            .where(builder => {
                builder.where('chat_rooms.employer_id', userId).orWhere('chat_rooms.candidate_id', userId);
            })
            .select(
                'chat_rooms.id',
                'chat_rooms.job_id',
                'chat_rooms.employer_id',
                'chat_rooms.candidate_id',
                'chat_rooms.created_at',
                { jobTitle: 'job_descriptions.title' },
            )
            .orderBy('chat_rooms.created_at', 'desc');
    }

    findRoomForUser(roomId, userId) {
        return db('chat_rooms')
            .where({ id: roomId })
            .andWhere(builder => {
                builder.where('employer_id', userId).orWhere('candidate_id', userId);
            })
            .first();
    }

    findRoomById(roomId) {
        return db('chat_rooms')
            .where({ id: roomId })
            .first();
    }

    findRoomByMembers(jobId, employerId, candidateId) {
        return db('chat_rooms')
            .where({
                job_id: jobId,
                employer_id: employerId,
                candidate_id: candidateId,
            })
            .first();
    }

    createRoom(data) {
        return db('chat_rooms')
            .insert(data)
            .returning('*')
            .then(rows => rows[0]);
    }

    findMessages(roomId, limit, offset) {
        return db('chat_messages')
            .where({ room_id: roomId })
            .orderBy('created_at', 'asc')
            .limit(limit)
            .offset(offset);
    }

    createMessage(data) {
        return db('chat_messages')
            .insert(data)
            .returning('*')
            .then(rows => rows[0]);
    }
}

export const ChatRepository = new Repository();
