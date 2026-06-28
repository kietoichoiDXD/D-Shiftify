import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository';

class Repository extends DataRepository {

    createOne(payload) {

        return this.query()
            .insert(payload)
            .returning([
                'id',
                'job_id as jobId',
                'cv_id as cvId',
                'status',
                'created_at as createdAt',
            ]);
    }

    findById(id , trx = null) {
        const queryBuilder = this.query()
            .join('jobs', 'jobs.id', 'applications.job_id')
            .join('cvs', 'cvs.id', 'applications.cv_id')
            .where('applications.id', id)
            .whereNull('applications.deleted_at')
            .select([
                'applications.id',
                { jobId: 'applications.job_id' },
                { cvId: 'applications.cv_id' },
                'applications.status',
                { createdAt: 'applications.created_at' },
                { jobTitle: 'jobs.title' },
            ])
            .first();
        if (trx) queryBuilder.transacting(trx);
        return queryBuilder;
    }

    getAll(page, size, filters = {}) {
        const offset = (page - 1) * size;
        const qb = this.query()
            .join('jobs', 'jobs.id', 'applications.job_id')
            .join('cvs', 'cvs.id', 'applications.cv_id')
            .leftJoin('profiles', 'profiles.id', 'cvs.profile_id');
        return this.#applyListFilters(qb, filters)
            .select([
                'applications.id',
                { jobId: 'applications.job_id' },
                { cvId: 'applications.cv_id' },
                'applications.status',
                { createdAt: 'applications.created_at' },
                { jobTitle: 'jobs.title' },
                { fullName: 'profiles.full_name' },
                { phone: 'profiles.phone' },
                { expectedJob: 'cvs.expected_job' },
                { skills: 'cvs.skills' },
            ])
            .orderBy('applications.created_at', 'desc')
            .limit(size)
            .offset(offset);
    }

    #applyListFilters(qb, { jobId, status } = {}) {
        qb.whereNull('applications.deleted_at');
        if (jobId) qb.where('applications.job_id', jobId);
        if (status) qb.where('applications.status', status);
        return qb;
    }

    getTotalCount(filters = {}) {
        return this.#applyListFilters(this.query(), filters)
            .count('applications.id as total')
            .first()
            .then(result => result || { total: 0 });
    }

    findByJobAndCv(jobId, cvId) {

        return this.query()
            .whereNull('applications.deleted_at')
            .where({
                job_id: jobId,
                cv_id: cvId,
            })
            .first();
    }

    updateStatus(id, status, trx = null) {

        const queryBuilder = this.query()
            .where('id', '=', id)
            .whereNull('deleted_at')
            .update({
                status,
                updated_at: new Date(),
            })
            .returning([
                'id',
                'job_id as jobId',
                'cv_id as cvId',
                'status',
                'updated_at as updatedAt',
            ]);

        if (trx) {
            queryBuilder.transacting(trx);
        }

        return queryBuilder;
    }

}

export const ApplicationsRepository = new Repository('applications');
