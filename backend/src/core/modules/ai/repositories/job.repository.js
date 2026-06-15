import db from '../../../database/index.js';

const TABLE = 'job_descriptions';

const vecLiteral = v => `[${v.join(',')}]`;

export const JobRepository = {
    async save(job) {
        const [row] = await db(TABLE)
            .insert(job)
            .onConflict('job_id')
            .merge()
            .returning('*');
        return row;
    },

    async findById(jobId) {
        return db(TABLE).where({ job_id: jobId }).first();
    },

    async findByEmployer(employerId) {
        return db(TABLE).where({ employer_id: employerId }).orderBy('created_at', 'desc');
    },

    async delete(jobId) {
        return db(TABLE).where({ job_id: jobId }).delete();
    },

    async vectorSearch(queryVec, topK = 30) {
        const vec = vecLiteral(queryVec);
        return db.raw(
            `SELECT job_id, employer_id, title, description_raw,
              required_skills, salary_min, salary_max,
              has_insurance, is_remote, location_lat, location_lng,
              work_environment, accessibility_score, accessibility_level, weights_json,
              1 - (embedding_vector <=> ?::vector) AS semantic_score
       FROM ${TABLE}
       WHERE embedding_vector IS NOT NULL
         AND accessibility_level IN ('AA', 'AAA')
         AND deleted_at IS NULL
       ORDER BY embedding_vector <=> ?::vector
       LIMIT ?`,
            [vec, vec, topK],
        ).then(r => r.rows);
    },

    async listAccessible(limit = 30) {
        return db(TABLE)
            .whereIn('accessibility_level', ['AA', 'AAA'])
            .whereNull('deleted_at')
            .select(
                'job_id',
                'employer_id',
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
                'weights_json',
                db.raw('0 as semantic_score'),
            )
            .orderBy('created_at', 'desc')
            .limit(limit);
    },
};
