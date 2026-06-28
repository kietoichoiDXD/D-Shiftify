const TARGETS = [
    { table: 'training_centers', constraint: 'training_centers_name_unique', index: 'training_centers_name_active_uq', cols: ['name'] },
    { table: 'training_centers', constraint: 'training_centers_email_unique', index: 'training_centers_email_active_uq', cols: ['email'] },
    { table: 'training_centers', constraint: 'training_centers_phone_unique', index: 'training_centers_phone_active_uq', cols: ['phone'] },
    { table: 'training_centers', constraint: 'training_centers_slogan_unique', index: 'training_centers_slogan_active_uq', cols: ['slogan'] },
    { table: 'applications', constraint: 'applications_job_id_cv_id_unique', index: 'applications_job_cv_active_uq', cols: ['job_id', 'cv_id'] },
];

exports.up = async knex => {
    for (const t of TARGETS) {
        await knex.raw(`ALTER TABLE "${t.table}" DROP CONSTRAINT IF EXISTS "${t.constraint}"`);
        const cols = t.cols.map(c => `"${c}"`).join(', ');
        await knex.raw(
            `CREATE UNIQUE INDEX IF NOT EXISTS "${t.index}" ON "${t.table}" (${cols}) WHERE deleted_at IS NULL`
        );
    }
};

exports.down = async knex => {
    for (const t of TARGETS) {
        await knex.raw(`DROP INDEX IF EXISTS "${t.index}"`);
        const cols = t.cols.map(c => `"${c}"`).join(', ');
        await knex.raw(
            `ALTER TABLE "${t.table}" ADD CONSTRAINT "${t.constraint}" UNIQUE (${cols})`
        );
    }
};
