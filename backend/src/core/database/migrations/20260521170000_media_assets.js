exports.up = async knex => {
    await knex.schema.createTable('media_assets', table => {
        table.increments('id').unsigned().primary();
        table.string('public_id', 255).notNullable().unique();
        table.string('url', 1000).notNullable();
        table.integer('owner_id').unsigned().nullable();
        table.string('folder', 255).nullable();
        table.string('original_name', 255).nullable();
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('deleted_at').defaultTo(null);

        table.foreign('owner_id').references('id').inTable('users').onDelete('SET NULL');
        table.index(['owner_id', 'deleted_at']);
    });
};

exports.down = knex => knex.schema.dropTableIfExists('media_assets');
