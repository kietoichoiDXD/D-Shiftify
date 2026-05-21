/**
 * Migration: job_descriptions + pgvector
 * Run: npm run knex migrate:latest
 */
export const up = async (knex) => {
  // Enable pgvector extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS vector');

  await knex.schema.createTable('job_descriptions', (t) => {
    t.uuid('job_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('employer_id').notNullable();
    t.string('title', 255).notNullable();
    t.text('description_raw');
    t.specificType('required_skills', 'TEXT[]');
    t.integer('salary_min');
    t.integer('salary_max');
    t.boolean('has_insurance').defaultTo(false);
    t.boolean('is_remote').defaultTo(false);
    t.float('location_lat');
    t.float('location_lng');
    t.string('work_environment', 255);   // e.g. 'screen_reader,quiet,flexible'
    t.float('accessibility_score');
    t.specificType('accessibility_level', 'CHAR(3)'); // 'A','AA','AAA'
    // vector(768) — text-embedding-004
    t.specificType('embedding_vector', 'vector(768)');
    t.timestamps(true, true);
  });

  // HNSW index for fast ANN search
  await knex.raw(`
    CREATE INDEX job_embedding_hnsw
    ON job_descriptions
    USING hnsw (embedding_vector vector_cosine_ops)
    WITH (m = 16, ef_construction = 64)
  `);

  // Filter index
  await knex.raw(`
    CREATE INDEX job_access_remote
    ON job_descriptions (accessibility_level, is_remote)
  `);
};

export const down = (knex) =>
  knex.schema.dropTableIfExists('job_descriptions');
