exports.up = async knex => {
    const exists = await knex.schema.hasTable('ai_observability_events');
    if (exists) return;
    await knex.schema.createTable('ai_observability_events', table => {
        table.bigIncrements('id').primary();
        table.string('event_type').notNullable();
        table.uuid('user_id').nullable();
        table.uuid('job_id').nullable();
        table.integer('final_score').nullable();
        table.float('semantic_score').nullable();
        table.float('compatibility_score').nullable();
        table.boolean('filtered_out').nullable();
        table.float('filtered_rate').nullable();
        table.string('fairness_tag').nullable();
        table.integer('explanation_length').nullable();
        table.integer('filter_reasons_count').nullable();
        table.jsonb('payload').nullable();
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = knex => knex.schema.dropTableIfExists('ai_observability_events');
