const tableName = 'candidate_profiles';

exports.up = async knex => {
  await knex.schema.alterTable(tableName, table => {
    table.date('dob').nullable();
    table.string('gender', 30).nullable();
    table.string('disability_status', 80).nullable();
    table.json('device_ids').defaultTo('[]');
    table.string('job_type', 80).nullable();
    table.string('work_mode', 80).nullable();
    table.string('mobility', 80).nullable();
    table.string('expected_job', 255).nullable();
    table.json('conditions').defaultTo('[]');
    table.json('certificates').defaultTo('[]');
    table.json('custom_sections').defaultTo('[]');
    table.json('cv_payload').defaultTo('{}');
  });
};

exports.down = async knex => {
  await knex.schema.alterTable(tableName, table => {
    table.dropColumn('dob');
    table.dropColumn('gender');
    table.dropColumn('disability_status');
    table.dropColumn('device_ids');
    table.dropColumn('job_type');
    table.dropColumn('work_mode');
    table.dropColumn('mobility');
    table.dropColumn('expected_job');
    table.dropColumn('conditions');
    table.dropColumn('certificates');
    table.dropColumn('custom_sections');
    table.dropColumn('cv_payload');
  });
};
