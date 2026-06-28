import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

class ParticipantRepository extends DataRepository {

    findParticipant(conversationId, userId) {
        return this.query().where(
            'participants.conversation_id',
            '=',
            conversationId
        ).where(
            'participants.user_id',
            '=',
            userId
        ).first();
    }

    findAllByConversationId(conversationId) {
        return this.query().innerJoin(
            'users',
            'users.id',
            'participants.user_id'
        ).where(
            'participants.conversation_id',
            '=',
            conversationId
        ).select(
            'participants.conversation_id as conversationId',
            'participants.user_id as userId',
            'users.email',
            'participants.created_at as createdAt',
            'participants.updated_at as updatedAt',
        );
    }

    create(participantData, trx = null) {

        const queryBuilder = this.query();

        if (trx) {
            queryBuilder.transacting(trx);
        }

        return queryBuilder
            .insert(participantData)
            .returning([
                'conversation_id as conversationId',
                'user_id as userId',
                'created_at as createdAt',
                'updated_at as updatedAt',
            ])
            .then(rows => rows[0]);
    }

    findDetailedByConversationId(conversationId) {
        const qb = this.query();
        return qb
            .innerJoin('users', 'users.id', 'participants.user_id')
            .leftJoin('profiles', 'profiles.user_id', 'participants.user_id')
            .leftJoin('companies', 'companies.user_id', 'participants.user_id')
            .where('participants.conversation_id', conversationId)
            .select(
                'participants.conversation_id as conversationId',
                'participants.user_id as userId',
                qb.client.raw('COALESCE(profiles.full_name, companies.name) as "fullName"'),
                'participants.created_at as createdAt',
            );
    }

    findConversationIdsByUserId(userId) {
        return this.query()
            .where('user_id', userId)
            .orderBy('updated_at', 'desc')
            .pluck('conversation_id');
    }

    createMany(rows, trx = null) {
        if (!rows.length) return Promise.resolve([]);
        const queryBuilder = this.query()
            .insert(rows)
            .onConflict(['conversation_id', 'user_id'])
            .ignore()
            .returning([
                'conversation_id as conversationId',
                'user_id as userId',
            ]);
        if (trx) queryBuilder.transacting(trx);
        return queryBuilder;
    }

    removeParticipant(conversationId, userId) {
        return this.query()
            .where('conversation_id', conversationId)
            .where('user_id', userId)
            .delete();
    }

    markReadAt(conversationId, userId, readAt = new Date()) {
        return this.query()
            .where('conversation_id', conversationId)
            .where('user_id', userId)
            .update({ last_read_at: readAt, updated_at: new Date() });
    }

    getNameByUserId(userId) {
        return this.query()
            .from('users')
            .join(
                'roles',
                'roles.id',
                'users.role_id'
            )
            .leftJoin(
                'profiles',
                'profiles.user_id',
                'users.id'
            )
            .leftJoin(
                'companies',
                'companies.user_id',
                'users.id'
            )
            .where(
                'users.id', userId
            )
            .select(
                'profiles.full_name as fullName',
                'companies.name as companyName'
            )
            .first();
    }
}

export const ParticipantsRepository = new ParticipantRepository('participants');
