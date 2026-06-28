import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

class Repository extends DataRepository {
    createOne(payload, trx = null) {
        const queryBuilder = this.query()
            .insert(payload)
            .returning([
                'id',
                'post_id as postId',
                'user_id as userId',
                'parent_id as parentId',
                'content',
                'created_at as createdAt',
            ]);
        if (trx) queryBuilder.transacting(trx);
        return queryBuilder;
    }

    findById(id) {
        return this.query()
            .leftJoin('users', 'users.id', 'comments.user_id')
            .leftJoin('profiles', 'profiles.user_id', 'users.id')
            .where('comments.id', id)
            .whereNull('comments.deleted_at')
            .select([
                'comments.id',
                { postId: 'comments.post_id' },
                { userId: 'comments.user_id' },
                { parentId: 'comments.parent_id' },
                'comments.content',
                { createdAt: 'comments.created_at' },
                { updatedAt: 'comments.updated_at' },
                { fullName: 'profiles.full_name' },
            ])
            .first();
    }

    listByPost(postId, page, size) {
        const offset = (page - 1) * size;
        return this.query()
            .leftJoin('users', 'users.id', 'comments.user_id')
            .leftJoin('profiles', 'profiles.user_id', 'users.id')
            .where('comments.post_id', postId)
            .whereNull('comments.deleted_at')
            .select([
                'comments.id',
                { userId: 'comments.user_id' },
                { parentId: 'comments.parent_id' },
                'comments.content',
                { createdAt: 'comments.created_at' },
                { fullName: 'profiles.full_name' },
            ])
            .orderBy('comments.created_at', 'asc')
            .limit(size)
            .offset(offset);
    }

    countByPost(postId) {
        return this.query()
            .where('post_id', postId)
            .whereNull('deleted_at')
            .count('id as total')
            .first()
            .then(r => (r ? parseInt(r.total, 10) : 0));
    }

    updateOne(id, content, trx = null) {
        const queryBuilder = this.query()
            .where('id', id)
            .whereNull('deleted_at')
            .update({ content, updated_at: new Date() })
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

export const CommentRepository = new Repository('comments');
