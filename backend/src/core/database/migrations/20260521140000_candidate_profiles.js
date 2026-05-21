const tableName = 'candidate_profiles'

exports.up = async knex => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')

  await knex.schema.createTable(tableName, table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().unique()
    table.string('full_name', 255).notNullable()
    table.string('email', 255).notNullable()
    table.string('phone', 20).nullable()
    table.string('location', 255).nullable()
    table.string('headline', 255).nullable()
    table.text('bio').nullable()
    table.string('profile_image', 500).nullable()
    table.json('skills').defaultTo('[]')
    table.json('education').defaultTo('[]')
    table.json('experience').defaultTo('[]')
    table.dateTime('deleted_at').defaultTo(null)
    table.timestamps(false, true)

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.index(['user_id', 'deleted_at'])
    table.index(['created_at'])
  })

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `)
}

exports.down = knex => knex.schema.dropTableIfExists(tableName)
