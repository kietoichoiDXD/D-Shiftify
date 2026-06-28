import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

class Repository extends DataRepository {
    createOne(payload, trx = null) {
        const queryBuilder = this.query()
            .insert(payload)
            .returning([
                'id',
                'user_id as userId',
                'content',
                'voice_url as voiceUrl',
                'topic',
                'created_at as createdAt',
            ]);
        if (trx) queryBuilder.transacting(trx);
        return queryBuilder;
    }

    findById(id) {
        return this.query()
            .leftJoin('users', 'users.id', 'community_posts.user_id')
            .leftJoin('profiles', 'profiles.user_id', 'users.id')
            .where('community_posts.id', id)
            .whereNull('community_posts.deleted_at')
            .select([
                'community_posts.id',
                { userId: 'community_posts.user_id' },
                'community_posts.content',
                { voiceUrl: 'community_posts.voice_url' },
                'community_posts.topic',
                { createdAt: 'community_posts.created_at' },
                { updatedAt: 'community_posts.updated_at' },
                { fullName: 'profiles.full_name' },
            ])
            .first();
    }

    list({ topic, userId, page, size }) {
        const offset = (page - 1) * size;
        const query = this.query()
            .leftJoin('users', 'users.id', 'community_posts.user_id')
            .leftJoin('profiles', 'profiles.user_id', 'users.id')
            .whereNull('community_posts.deleted_at')
            .select([
                'community_posts.id',
                { userId: 'community_posts.user_id' },
                'community_posts.content',
                { voiceUrl: 'community_posts.voice_url' },
                'community_posts.topic',
                { createdAt: 'community_posts.created_at' },
                { fullName: 'profiles.full_name' },
            ])
            .orderBy('community_posts.created_at', 'desc')
            .limit(size)
            .offset(offset);
        if (topic) query.where('community_posts.topic', topic);
        if (userId) query.where('community_posts.user_id', userId);
        return query;
    }

    total({ topic, userId }) {
        const query = this.query().whereNull('deleted_at').count('id as total').first();
        if (topic) query.where('topic', topic);
        if (userId) query.where('user_id', userId);
        return query.then(r => (r ? parseInt(r.total, 10) : 0));
    }

    updateOne(id, payload, trx = null) {
        const queryBuilder = this.query()
            .where('id', id)
            .whereNull('deleted_at')
            .update({ ...payload, updated_at: new Date() })
            .returning(['id', { updatedAt: 'updated_at' }]);
        if (trx) queryBuilder.transacting(trx);
        return queryBuilder;
    }

    softDelete(id, trx = null) {
        const queryBuilder = this.query()
            .where('id', id)
            .whereNull('deleted_at')
            .update({ deleted_at: new Date() })
            .returning(['id', { deletedAt: 'deleted_at' }]);
        if (trx) queryBuilder.transacting(trx);
        return queryBuilder;
    }
}

export const CommunityPostRepository = new Repository('community_posts');
