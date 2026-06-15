exports.up = async knex => {
    const hasLogoUrl = await knex.schema.hasColumn('job_descriptions', 'company_logo_url');
    const hasLogoPublicId = await knex.schema.hasColumn('job_descriptions', 'company_logo_public_id');

    await knex.schema.alterTable('job_descriptions', table => {
        if (!hasLogoUrl) table.string('company_logo_url', 500).nullable();
        if (!hasLogoPublicId) table.string('company_logo_public_id', 255).nullable();
    });
};

exports.down = async knex => {
    const hasLogoUrl = await knex.schema.hasColumn('job_descriptions', 'company_logo_url');
    const hasLogoPublicId = await knex.schema.hasColumn('job_descriptions', 'company_logo_public_id');

    await knex.schema.alterTable('job_descriptions', table => {
        if (hasLogoPublicId) table.dropColumn('company_logo_public_id');
        if (hasLogoUrl) table.dropColumn('company_logo_url');
    });
};
