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

    /**
     * List jobs with optional filters + pagination.
     * Production pattern: safe SQL binding, index-friendly WHERE clauses.
     *
     * @param {object} filters
     * @param {string[]} [filters.skills]       - required_skills overlap
     * @param {boolean}  [filters.isRemote]     - remote filter
     * @param {number}   [filters.salaryMin]    - minimum salary
     * @param {number}   [filters.salaryMax]    - maximum salary
     * @param {string}   [filters.keyword]      - full-text search on title
     * @param {number}   [filters.limit=20]
     * @param {number}   [filters.offset=0]
     * @returns {{ data: object[], total: number }}
     */
    async findAll({ skills, isRemote, salaryMin, salaryMax, keyword, status = 'open', limit = 20, offset = 0 } = {}) {
        const build = qb => {
            // Only show AA/AAA accessible jobs to public
            qb.whereIn('accessibility_level', ['AA', 'AAA']);
            qb.whereNull('deleted_at');

            if (status) {
                qb.where({ status });
            }

            if (isRemote !== undefined && isRemote !== null) {
                qb.where({ is_remote: isRemote });
            }

            if (salaryMin !== undefined && salaryMin !== null) {
                qb.where('salary_max', '>=', salaryMin);
            }

            if (salaryMax !== undefined && salaryMax !== null) {
                qb.where('salary_min', '<=', salaryMax);
            }

            if (keyword) {
                // Case-insensitive title search using ILIKE
                qb.whereILike('title', `%${keyword}%`);
            }

            if (skills && skills.length > 0) {
                // PostgreSQL array overlap: required_skills && ARRAY['skill1','skill2']
                qb.whereRaw('required_skills && ?', [skills]);
            }
        };

        const [rows, countResult] = await Promise.all([
            db(TABLE)
                .modify(build)
                .select(
                    'job_id',
                    'employer_user_id',
                    'title',
                    'description_raw',
                    'required_skills',
                    'salary_min',
                    'salary_max',
                    'has_insurance',
                    'is_remote',
                    'location_lat',
                    'location_lng',
                    'work_environment',
                    'accessibility_score',
                    'accessibility_level',
                    'application_count',
                    'status',
                    'created_at',
                )
                .orderBy('created_at', 'desc')
                .limit(limit)
                .offset(offset),
            db(TABLE)
                .modify(build)
                .count('job_id as total')
                .first(),
        ]);

        return {
            data: rows,
            total: parseInt(countResult?.total ?? 0, 10),
            limit,
            offset,
        };
    }

    incrementApplicationCount(jobId, trx = null) {
        return this.query(trx)(TABLE)
            .where({ job_id: jobId })
            .increment('application_count', 1);
    }

    /**
     * Get all candidates who applied to a specific job, with candidate profile info.
     * @param {string} jobId  - UUID
     * @param {number} employerUserId - must own the job
     */
    async findApplicantsByJobId(jobId, employerUserId) {
        // Verify employer owns the job first
        const job = await db(TABLE)
            .where({ job_id: jobId, employer_user_id: employerUserId })
            .first();

        if (!job) return null; // caller handles 404/403

        return db('job_applications as app')
            .join('users as u', 'app.candidate_id', 'u.id')
            .leftJoin('candidate_profiles as cp', db.raw('cp.user_id::text = u.id::text'))
            .where('app.job_id', jobId)
            .select(
                'app.id as application_id',
                'app.candidate_id',
                'app.status',
                'app.created_at as applied_at',
                'u.email',
                'cp.full_name',
                'cp.phone',
                'cp.headline',
                'cp.location',
                'cp.skills',
                'cp.profile_image',
            )
            .orderBy('app.created_at', 'desc');
    }

    /** Get employer's own jobs */
    findByEmployerUserId(employerUserId) {
        return db(TABLE)
            .where({ employer_user_id: employerUserId })
            .whereNull('deleted_at')
            .select(
                'job_id', 'title', 'description_raw',
                'required_skills', 'salary_min', 'salary_max',
                'has_insurance', 'is_remote', 'accessibility_score',
                'accessibility_level', 'application_count', 'status', 'created_at',
            )
            .orderBy('created_at', 'desc');
    }

    findAllForAdmin({ status, keyword, limit = 20, offset = 0 } = {}) {
        const build = qb => {
            qb.whereNull('deleted_at');
            if (status) qb.where({ status });
            if (keyword) qb.whereILike('title', `%${keyword}%`);
        };

        return Promise.all([
            db(TABLE).modify(build).select('*').orderBy('created_at', 'desc').limit(limit).offset(offset),
            db(TABLE).modify(build).count('job_id as total').first(),
        ]).then(([data, countResult]) => ({
            data,
            total: parseInt(countResult?.total ?? 0, 10),
            limit,
            offset,
        }));
    }

    updateOwned(jobId, employerUserId, data) {
        return db(TABLE)
            .where({ job_id: jobId, employer_user_id: employerUserId })
            .whereNull('deleted_at')
            .update({
                ...data,
                updated_at: new Date(),
            })
            .returning('*')
            .then(rows => rows[0]);
    }

    softDeleteOwned(jobId, employerUserId) {
        return db(TABLE)
            .where({ job_id: jobId, employer_user_id: employerUserId })
            .whereNull('deleted_at')
            .update({
                deleted_at: new Date(),
                updated_at: new Date(),
            })
            .returning('*')
            .then(rows => rows[0]);
    }

    updateLogoOwned(jobId, employerUserId, { url, publicId }) {
        return db(TABLE)
            .where({ job_id: jobId, employer_user_id: employerUserId })
            .whereNull('deleted_at')
            .update({
                company_logo_url: url,
                company_logo_public_id: publicId,
                updated_at: new Date(),
            })
            .returning('*')
            .then(rows => rows[0]);
    }
}

export const RecruitmentJobRepository = new Repository();
