import db from 'core/database';

const TABLE = 'education_classes';

class Repository {
    create(data) {
        return db(TABLE)
            .insert(data)
            .returning('*')
            .then(rows => rows[0]);
    }

    findById(id) {
        return db(TABLE)
            .where({ id })
            .whereNull('deleted_at')
            .first();
    }
}

export const ClassRepository = new Repository();
