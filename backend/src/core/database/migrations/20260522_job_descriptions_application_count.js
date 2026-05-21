exports.up = knex => knex.schema.alterTable('job_descriptions', table => {
    table.integer('application_count').unsigned().notNullable().defaultTo(0);
});

exports.down = knex => knex.schema.alterTable('job_descriptions', table => {
    table.dropColumn('application_count');
});
