exports.up = knex => knex('roles')
    .where({ name: 'EMPLOYER' })
    .first()
    .then(role => {
        if (role) return null;
        return knex('roles').insert({ name: 'EMPLOYER' });
    });

exports.down = knex => knex('roles')
    .where({ name: 'EMPLOYER' })
    .delete();
