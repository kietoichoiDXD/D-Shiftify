import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

class ConversationRepository extends DataRepository {
    create(conversationData, trx = null) {

        const queryBuilder = this.query()
            .insert(conversationData)
            .returning([
                'id',
                'created_at as createdAt',
                'updated_at as updatedAt',
            ]);

        if (trx) {
            queryBuilder.transacting(trx);
        }

        return queryBuilder.then(rows => rows[0]);
    }

    findById(id) {
        return this.query().where('conversations.id', '=', id).select(
            'conversations.id',
            'conversations.created_at as createdAt',
            'conversations.updated_at as updatedAt',
        ).first();
    }

    findAllByUserId(userId) {
        return this.query()
            .from('conversations')
            .join(
                'participants as p1',
                'p1.conversation_id',
                'conversations.id'
            )
            .join(
                'participants as p2',
                'p2.conversation_id',
                'conversations.id'
            )
            .leftJoin(
                'profiles',
                'profiles.user_id',
                'p2.user_id'
            )
            .leftJoin(
                'companies',
                'companies.user_id',
                'p2.user_id'
            )
            .where('p1.user_id', userId)
            .whereNot('p2.user_id', userId)
            .select(
                'conversations.id',
                'conversations.created_at as createdAt',
                'conversations.updated_at as updatedAt',
                'profiles.full_name as fullName',
                'companies.name as companyName',
            );
    }

    update(id, conversationData) {
        return this.query().where('id', id).update({
            ...conversationData,
            updated_at: new Date(),
        }).returning([
            'id',
            'created_at as createdAt',
            'updated_at as updatedAt',
        ]).then((rows) => rows[0]);
    }
}

export const ConversationsRepository = new ConversationRepository('conversations');