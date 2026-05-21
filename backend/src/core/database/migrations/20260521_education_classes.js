const tableName = 'education_classes';

exports.up = async knex => {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    await knex.schema.createTable(tableName, table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.integer('created_by').unsigned().notNullable();
        table.string('title', 255).notNullable();
        table.text('description').notNullable();
        table.string('level', 50).notNullable();
        table.string('category', 100).notNullable();
        table.dateTime('start_date').notNullable();
        table.dateTime('end_date').notNullable();
        table.integer('max_students').unsigned().notNullable();
        table.string('thumbnail_url', 1000);
        table.string('thumbnail_public_id', 255);
        table.string('status', 30).notNullable().defaultTo('DRAFT');
        table.dateTime('deleted_at').defaultTo(null);
        table.timestamps(false, true);

        table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
        table.index(['created_by', 'status']);
    });

    await knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tableName}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
    `);
};

exports.down = knex => knex.schema.dropTableIfExists(tableName);
