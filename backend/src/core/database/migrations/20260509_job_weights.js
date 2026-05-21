export const up = (knex) =>
  knex.schema.alterTable('job_descriptions', (t) => {
    t.jsonb('weights_json').nullable();
  });

export const down = (knex) =>
  knex.schema.alterTable('job_descriptions', (t) => {
    t.dropColumn('weights_json');
  });
