exports.up = async knex => {
    const hasStatus = await knex.schema.hasColumn('job_descriptions', 'status');
    const hasDeletedAt = await knex.schema.hasColumn('job_descriptions', 'deleted_at');

    await knex.schema.alterTable('job_descriptions', table => {
        if (!hasStatus) table.string('status', 30).notNullable().defaultTo('open');
        if (!hasDeletedAt) table.dateTime('deleted_at').defaultTo(null);
    });

    if (!hasStatus) {
        await knex.schema.alterTable('job_descriptions', table => {
            table.index(['status', 'created_at']);
        });
    }
};

exports.down = async knex => {
    const hasStatus = await knex.schema.hasColumn('job_descriptions', 'status');
    const hasDeletedAt = await knex.schema.hasColumn('job_descriptions', 'deleted_at');

    await knex.schema.alterTable('job_descriptions', table => {
        if (hasStatus) table.dropColumn('status');
        if (hasDeletedAt) table.dropColumn('deleted_at');
    });
};
