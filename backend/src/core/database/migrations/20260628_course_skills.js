exports.up = async knex => {
    const exists = await knex.schema.hasTable('course_skills');
    if (exists) return;
    await knex.schema.createTable('course_skills', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('course_id').notNullable();
        table.string('name').notNullable();
        table.string('type').defaultTo('hard');
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
        table.index('course_id');
    });
};

exports.down = knex => knex.schema.dropTableIfExists('course_skills');
