exports.up = async knex => {
    const hasColumn = await knex.schema.hasColumn('participants', 'last_read_at');
    if (!hasColumn) {
        await knex.schema.alterTable('participants', table => {
            table.dateTime('last_read_at').nullable();
        });
    }
};

exports.down = async knex => {
    const hasColumn = await knex.schema.hasColumn('participants', 'last_read_at');
    if (hasColumn) {
        await knex.schema.alterTable('participants', table => {
            table.dropColumn('last_read_at');
        });
    }
};
