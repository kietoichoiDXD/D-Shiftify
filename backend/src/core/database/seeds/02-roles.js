/**
 * @param {import("knex")} knex
 */

exports.seed = knex => knex('roles')
    .del()
    .then(() => knex('roles').insert([
        {
            name: 'SUPER_ADMIN',
        },
        {
            name: 'ADMIN',
        },
        {
            name: 'EMPLOYER',
        },
        {
            name: 'CANDIDATE',
        },
        {
            name: 'USER',
        },
    ]));
