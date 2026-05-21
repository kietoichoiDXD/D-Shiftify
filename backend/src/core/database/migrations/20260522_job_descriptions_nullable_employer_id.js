exports.up = knex => knex.schema.alterTable('job_descriptions', table => {
    table.uuid('employer_id').nullable().alter();
});

exports.down = knex => knex.schema.alterTable('job_descriptions', table => {
    table.uuid('employer_id').notNullable().alter();
});
