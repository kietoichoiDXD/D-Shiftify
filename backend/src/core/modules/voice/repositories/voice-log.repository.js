import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

const COLUMNS = [
    'id',
    'user_id as userId',
    'type',
    'source',
    'reference_id as referenceId',
    'status',
    'created_at as createdAt',
    'updated_at as updatedAt',
];

class VoiceLogRepositoryImpl extends DataRepository {
    createOne(data) {
        return this.query().insert(data).returning(COLUMNS).then(rows => rows[0]);
    }

    findById(id) {
        return this.query().where('id', id).select(COLUMNS).first();
    }

    #applyFilters(qb, { type, source, status, userId }) {
        if (type) qb.where('type', type);
        if (source) qb.where('source', source);
        if (status) qb.where('status', status);
        if (userId) qb.where('user_id', userId);
        return qb;
    }

    list({ type, source, status, userId, page = 1, size = 20 }) {
        const qb = this.#applyFilters(this.query(), { type, source, status, userId });
        return qb
            .orderBy('created_at', 'desc')
            .limit(size)
            .offset((Math.max(1, page) - 1) * size)
            .select(COLUMNS);
    }

    async total(filters) {
        const row = await this.#applyFilters(this.query(), filters).count({ count: '*' }).first();
        return Number(row?.count || 0);
    }

    updateStatus(id, status) {
        return this.query()
            .where('id', id)
            .update({ status, updated_at: new Date() })
            .returning(COLUMNS)
            .then(rows => rows[0]);
    }

    deleteById(id) {
        return this.query().where('id', id).delete();
    }

    async summary({ from, to, userId }) {
        const qb = this.query();
        if (userId) qb.where('user_id', userId);
        if (from) qb.where('created_at', '>=', from);
        if (to) qb.where('created_at', '<=', `${to} 23:59:59`);

        const totals = await qb.clone().count({ count: '*' }).first();
        const success = await qb.clone().where('status', 'success').count({ count: '*' }).first();
        const failed = await qb.clone().where('status', 'failed').count({ count: '*' }).first();

        const daily = await qb
            .clone()
            .select(this.query().client.raw("to_char(created_at, 'YYYY-MM-DD') as date"))
            .count({ count: '*' })
            .groupByRaw("to_char(created_at, 'YYYY-MM-DD')")
            .orderByRaw("to_char(created_at, 'YYYY-MM-DD') asc");

        return {
            total: Number(totals?.count || 0),
            success: Number(success?.count || 0),
            failed: Number(failed?.count || 0),
            daily: daily.map(d => ({ date: d.date, count: Number(d.count) })),
        };
    }
}

export const VoiceLogRepository = new VoiceLogRepositoryImpl('voice_logs');
