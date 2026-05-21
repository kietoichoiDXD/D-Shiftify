exports.up = async knex => {
    await knex.schema.createTable('chat_messages', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('room_id').notNullable();
        table.integer('sender_id').unsigned().notNullable();
        table.text('content').notNullable();
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());

        table.foreign('room_id').references('id').inTable('chat_rooms').onDelete('CASCADE');
        table.foreign('sender_id').references('id').inTable('users').onDelete('CASCADE');
        table.index(['room_id', 'created_at']);
    });
};

exports.down = knex => knex.schema.dropTableIfExists('chat_messages');
