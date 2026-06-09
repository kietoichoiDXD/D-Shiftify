exports.up = async knex => {
    await knex.schema.createTable('education_enrollments', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('class_id').notNullable();
        table.uuid('student_id').notNullable();
        table.dateTime('enrolled_at').notNullable().defaultTo(knex.fn.now());
        table.string('status', 30).notNullable().defaultTo('ENROLLED'); // ENROLLED, COMPLETED, DROPPED

        table.foreign('class_id').references('id').inTable('education_classes').onDelete('CASCADE');
        table.foreign('student_id').references('id').inTable('users').onDelete('CASCADE');
        table.unique(['class_id', 'student_id']);
        table.index(['student_id']);
        table.index(['class_id']);
    });
};

exports.down = knex => knex.schema.dropTableIfExists('education_enrollments');
