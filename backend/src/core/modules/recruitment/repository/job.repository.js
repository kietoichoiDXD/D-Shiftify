import db from 'core/database';

const TABLE = 'job_descriptions';

class Repository {
    query(trx = null) {
        return trx || db;
    }

    create(data, trx = null) {
        return this.query(trx)(TABLE)
            .insert(data)
            .returning('*')
            .then(rows => rows[0]);
    }

    findById(jobId, trx = null) {
        return this.query(trx)(TABLE)
            .where({ job_id: jobId })
            .first();
    }

    incrementApplicationCount(jobId, trx = null) {
        return this.query(trx)(TABLE)
            .where({ job_id: jobId })
            .increment('application_count', 1);
    }
}

export const RecruitmentJobRepository = new Repository();
