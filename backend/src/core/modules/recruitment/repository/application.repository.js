import db from 'core/database';

const TABLE = 'job_applications';

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

    findByJobAndCandidate(jobId, candidateId, trx = null) {
        return this.query(trx)(TABLE)
            .where({ job_id: jobId, candidate_id: candidateId })
            .first();
    }
}

export const JobApplicationRepository = new Repository();
