import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

class MessageRepository extends DataRepository {

    create(messageData, trx = null) {
        const queryBuilder = this.query()
            .insert(messageData).returning([
             'id',
            'conversation_id as conversationId',
            'sender_id as senderId',
            'content',
            'voice_url as voiceUrl',
            'created_at as createdAt',
            'updated_at as updatedAt',
            ]);

        if (trx) {
            queryBuilder.transacting(trx);
        }
        return queryBuilder.then(rows => rows[0]);
    }

    findById(id) {
        return this.query().where('messages.id', '=', id).whereNull('messages.deleted_at').select(
            'messages.id',
            'messages.conversation_id as conversationId',
            'messages.sender_id as senderId',
            'messages.content',
            'messages.voice_url as voiceUrl',
            'messages.created_at as createdAt',
            'messages.updated_at as updatedAt',
        ).first();
    }

    findAllByConversationId(conversationId) {
        return this.query()
            .from('messages')
            .join(
                'users',
                'users.id',
                'messages.sender_id'
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
                'messages.conversation_id',
                conversationId
            )
            .whereNull(
                'messages.deleted_at'
            )
            .select(
                'messages.id',
                'messages.conversation_id as conversationId',
                'messages.sender_id as senderId',
                'messages.content',
                'messages.voice_url as voiceUrl',
                'messages.created_at as createdAt',
                'messages.updated_at as updatedAt',

                'profiles.full_name as fullName',
                'companies.name as companyName',
            )
            .orderBy(
                'messages.created_at',
                'asc'
            );
    }

    getLastMessage(conversationId) {
        return this.query()
            .where('conversation_id', conversationId)
            .whereNull('deleted_at')
            .orderBy('created_at', 'desc')
            .select(
                'id',
                'content',
                'voice_url as voiceUrl',
                'sender_id as senderId',
                'created_at as createdAt',
            )
            .first();
    }

    async findByCursor(conversationId, cursorCreatedAt, limit) {
        const qb = this.query()
            .where('conversation_id', conversationId)
            .whereNull('deleted_at');
        if (cursorCreatedAt) qb.where('created_at', '<', cursorCreatedAt);
        return qb
            .orderBy('created_at', 'desc')
            .limit(limit)
            .select(
                'id',
                'conversation_id as conversationId',
                'sender_id as senderId',
                'content',
                'voice_url as voiceUrl',
                'created_at as createdAt',
            );
    }

    async countUnread(conversationId, userId, lastReadAt) {
        const qb = this.query()
            .where('conversation_id', conversationId)
            .whereNull('deleted_at')
            .whereNot('sender_id', userId);
        if (lastReadAt) qb.where('created_at', '>', lastReadAt);
        const row = await qb.count({ count: '*' }).first();
        return Number(row?.count || 0);
    }

    findCreatedAtById(id) {
        return this.query().where('id', id).select('created_at as createdAt').first();
    }

    softDelete(id) {
        return this.query()
            .where('id', id)
            .whereNull('deleted_at')
            .update({ deleted_at: new Date(), updated_at: new Date() });
    }

    update(id, messageData) {
        return this.query().where('id', id).update({
            ...messageData,
            updated_at: new Date(),
        }).returning([
            'id',
            'conversation_id as conversationId',
            'sender_id as senderId',
            'content',
            'voice_url as voiceUrl',
            'created_at as createdAt',
            'updated_at as updatedAt',
        ]).then((rows) => rows[0]);
    }
}

export const MessagesRepository = new MessageRepository('messages');
