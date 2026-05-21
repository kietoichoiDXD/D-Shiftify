exports.up = knex => knex('roles')
    .where({ name: 'CANDIDATE' })
    .first()
    .then(role => {
        if (role) return null;
        return knex('roles').insert({ name: 'CANDIDATE' });
    });

exports.down = knex => knex('roles')
    .where({ name: 'CANDIDATE' })
    .delete();
