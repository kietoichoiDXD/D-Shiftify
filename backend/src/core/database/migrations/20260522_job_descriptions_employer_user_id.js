exports.up = knex => knex.schema.alterTable('job_descriptions', table => {
    table.uuid('employer_user_id').nullable();
    table.foreign('employer_user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['employer_user_id']);
});

exports.down = knex => knex.schema.alterTable('job_descriptions', table => {
    table.dropIndex(['employer_user_id']);
    table.dropColumn('employer_user_id');
});
