exports.up = async knex => {
    await knex.schema.createTable('job_applications', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('job_id').notNullable();
        table.integer('candidate_id').unsigned().notNullable();
        table.string('status', 30).notNullable().defaultTo('PENDING');
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());

        table.foreign('job_id').references('job_id').inTable('job_descriptions').onDelete('CASCADE');
        table.foreign('candidate_id').references('id').inTable('users').onDelete('CASCADE');
        table.unique(['job_id', 'candidate_id']);
        table.index(['candidate_id', 'status']);
    });

    await knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON job_applications
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
    `);
};

exports.down = knex => knex.schema.dropTableIfExists('job_applications');
