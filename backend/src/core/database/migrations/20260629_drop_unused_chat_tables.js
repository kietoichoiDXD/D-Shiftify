// Drop the abandoned chat_rooms / chat_messages tables.
// These were created by 20260522_chat_1_rooms.js and 20260522_chat_2_messages.js
// for an earlier chat implementation that was replaced by the
// conversations/participants/messages schema (20260424130013_create_chat.js).
// The room-based service/repository code has been removed, so the tables are dead.
exports.up = async knex => {
    await knex.schema.dropTableIfExists('chat_messages');
    await knex.schema.dropTableIfExists('chat_rooms');
};

// Reverse: recreate the tables exactly as the original two migrations did,
// so a rollback restores the prior schema state.
exports.down = async knex => {
    await knex.schema.createTable('chat_rooms', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('job_id').notNullable();
        table.uuid('employer_id').notNullable();
        table.uuid('candidate_id').notNullable();
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());

        table.foreign('job_id').references('job_id').inTable('job_descriptions').onDelete('CASCADE');
        table.foreign('employer_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('candidate_id').references('id').inTable('users').onDelete('CASCADE');
        table.unique(['job_id', 'employer_id', 'candidate_id']);
        table.index(['employer_id']);
        table.index(['candidate_id']);
    });

    await knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON chat_rooms
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
    `);

    await knex.schema.createTable('chat_messages', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('room_id').notNullable();
        table.uuid('sender_id').notNullable();
        table.text('content').notNullable();
        table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());

        table.foreign('room_id').references('id').inTable('chat_rooms').onDelete('CASCADE');
        table.foreign('sender_id').references('id').inTable('users').onDelete('CASCADE');
        table.index(['room_id', 'created_at']);
    });
};
