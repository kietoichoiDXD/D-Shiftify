exports.up = async knex => {
    const exists = await knex.schema.hasTable('ai_knowledge_chunks');
    if (exists) return;
    await knex.schema.createTable('ai_knowledge_chunks', table => {
        table.bigIncrements('id').primary();
        table.uuid('job_id').nullable();
        table.string('kind').notNullable();
        table.string('title').notNullable();
        table.text('chunk_text').notNullable();
        table.specificType('embedding_vector', 'vector').nullable();
        table.jsonb('metadata').nullable();
        table.jsonb('signals').nullable();
        table.jsonb('keywords').nullable();
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = knex => knex.schema.dropTableIfExists('ai_knowledge_chunks');
