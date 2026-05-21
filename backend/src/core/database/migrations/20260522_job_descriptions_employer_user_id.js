exports.up = knex => knex.schema.alterTable('job_descriptions', table => {
    table.integer('employer_user_id').unsigned().nullable();
    table.foreign('employer_user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['employer_user_id']);
});

exports.down = knex => knex.schema.alterTable('job_descriptions', table => {
    table.dropIndex(['employer_user_id']);
    table.dropColumn('employer_user_id');
});
