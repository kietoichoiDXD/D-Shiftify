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

    findById(applicationId, trx = null) {
        return this.query(trx)(TABLE)
            .where({ id: applicationId })
            .first();
    }

    /**
     * List all applications for a candidate with job info.
     * @param {number} candidateId
     */
    findByCandidateId(candidateId) {
        return db(TABLE)
            .join('job_descriptions as jd', 'job_applications.job_id', 'jd.job_id')
            .where('job_applications.candidate_id', candidateId)
            .select(
                'job_applications.id as application_id',
                'job_applications.status',
                'job_applications.created_at as applied_at',
                'job_applications.updated_at',
                'jd.job_id',
                'jd.title',
                'jd.salary_min',
                'jd.salary_max',
                'jd.is_remote',
                'jd.employer_user_id',
            )
            .orderBy('job_applications.created_at', 'desc');
    }

    /**
     * Update application status. Enforces valid transitions:
     *   PENDING → ACCEPTED | REJECTED
     *   (no backward transitions allowed)
     *
     * @param {string} applicationId - UUID
     * @param {string} status        - 'ACCEPTED' | 'REJECTED' | 'PENDING'
     * @param {object} trx           - optional Knex transaction
     */
    updateStatus(applicationId, status, trx = null) {
        return this.query(trx)(TABLE)
            .where({ id: applicationId })
            .update({
                status,
                updated_at: new Date(),
            })
            .returning('*')
            .then(rows => rows[0]);
    }
}

export const JobApplicationRepository = new Repository();
