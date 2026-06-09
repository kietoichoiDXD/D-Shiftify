import db from 'core/database';

const TABLE = 'education_classes';
const ENROLLMENT_TABLE = 'education_enrollments';

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

    findAll(filters = {}) {
        const query = db(TABLE).whereNull('deleted_at');

        if (filters.status) {
            query.where('status', filters.status);
        }
        if (filters.level) {
            query.where('level', filters.level);
        }
        if (filters.category) {
            query.where('category', 'like', `%${filters.category}%`);
        }
        if (filters.createdBy) {
            query.where('created_by', filters.createdBy);
        }

        const limit = filters.limit ? parseInt(filters.limit, 10) : 20;
        const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

        return query
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);
    }

    update(id, data) {
        return db(TABLE)
            .where({ id })
            .update(data)
            .returning('*')
            .then(rows => rows[0]);
    }

    delete(id) {
        return db(TABLE)
            .where({ id })
            .update({ deleted_at: db.fn.now() });
    }

    findEnrollment(classId, studentId) {
        return db(ENROLLMENT_TABLE)
            .where({ class_id: classId, student_id: studentId })
            .first();
    }

    enrollStudent(classId, studentId) {
        return db(ENROLLMENT_TABLE)
            .insert({
                class_id: classId,
                student_id: studentId,
            })
            .returning('*')
            .then(rows => rows[0]);
    }

    countStudents(classId) {
        return db(ENROLLMENT_TABLE)
            .where({ class_id: classId })
            .count('student_id as total')
            .first()
            .then(row => parseInt(row?.total || 0, 10));
    }
}

export const ClassRepository = new Repository();
