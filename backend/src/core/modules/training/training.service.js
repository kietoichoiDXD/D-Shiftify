import connection, { getTransaction } from 'core/database';
import { NotFoundException, BadRequestException } from 'packages/httpException';
import { ForbiddenException } from 'packages/httpException/ForbiddenException';

const centerPayload = body => ({
    name: body.name,
    slogan: body.slogan || null,
    phone: body.phone || null,
    email: body.email,
    website: body.website || null,
    organization_type: body.organizationType || null,
    support_for_disabled: body.supportForDisabled || null,
    partner_companies: body.partnerCompanies || null,
    achievements: [body.achievements, body.address ? `Địa chỉ: ${body.address}` : ''].filter(Boolean).join('\n') || null,
});

const toResponse = center => ({
    id: center.id, name: center.name, slogan: center.slogan, phone: center.phone, email: center.email,
    website: center.website, organizationType: center.organization_type, supportForDisabled: center.support_for_disabled,
    partnerCompanies: center.partner_companies, achievements: center.achievements, licenseFile: center.license_file, logoUrl: center.logo_url,
});

class TrainingServiceClass {
    async findMine(userId) {
        return connection('training_centers')
            .innerJoin('user_training_centers', 'user_training_centers.center_id', 'training_centers.id')
            .where('user_training_centers.user_id', userId)
            .whereNull('training_centers.deleted_at')
            .select('training_centers.*')
            .first();
    }

    async getMine(userId) {
        const center = await this.findMine(userId);
        if (!center) throw new NotFoundException('Training center profile not found');
        return toResponse(center);
    }

    async upsertMine(userId, body) {
        const existing = await this.findMine(userId);
        const trx = await getTransaction();
        try {
            let center;
            if (existing) {
                [center] = await connection('training_centers').where('id', existing.id).update({ ...centerPayload(body), updated_at: new Date() }).returning('*').transacting(trx);
            } else {
                [center] = await connection('training_centers').insert(centerPayload(body)).returning('*').transacting(trx);
                await connection('user_training_centers').insert({ user_id: userId, center_id: center.id, enrolled_at: new Date(), status: 'studying' }).transacting(trx);
            }
            await trx.commit();
            return toResponse(center);
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async createCourse(userId, body) {
        const center = await this.findMine(userId);
        if (!center) throw new NotFoundException('Create a training center profile first');
        const [course] = await connection('courses').insert({
            center_id: center.id,
            title: body.title,
            duration_type: body.durationType,
            start_date: body.startDate,
            end_date: body.endDate,
            mode: body.mode,
            certificate_output: body.certificateOutput || null,
            description: body.description,
        }).returning('*');
        return { id: course.id, title: course.title };
    }

    async register(userId, body) {
        const existing = await this.findMine(userId);
        if (existing) throw new BadRequestException('Bạn đã có hồ sơ trung tâm đào tạo');
        const result = await this.upsertMine(userId, body);
        return { training_center_id: result.id, status: 'success', message: 'Đăng ký trung tâm đào tạo thành công' };
    }

    async deleteMine(userId) {
        const center = await this.findMine(userId);
        if (!center) throw new NotFoundException('Training center profile not found');
        await connection('training_centers').where('id', center.id).update({ deleted_at: new Date(), updated_at: new Date() });
        return { status: 'success', message: 'Đã xóa hồ sơ trung tâm đào tạo', deleted_at: new Date().toISOString() };
    }

    async listCenters({ page = 1, limit = 20 } = {}) {
        const base = connection('training_centers').whereNull('deleted_at');
        const totalRow = await base.clone().count({ count: '*' }).first();
        const rows = await base.clone()
            .orderBy('created_at', 'desc')
            .limit(limit).offset((Math.max(1, page) - 1) * limit)
            .select('id', 'name', 'organization_type', 'logo_url', 'support_for_disabled', 'created_at');
        return {
            total: Number(totalRow?.count || 0),
            data: rows.map(c => ({
                training_center_id: c.id,
                name: c.name,
                organization_type: c.organization_type,
                logo_url: c.logo_url,
                support_for_disabled: c.support_for_disabled,
                created_at: c.created_at instanceof Date ? c.created_at.toISOString() : c.created_at,
            })),
        };
    }

    async getCenterById(id) {
        const center = await connection('training_centers').where('id', id).whereNull('deleted_at').first();
        if (!center) throw new NotFoundException('Không tìm thấy trung tâm đào tạo');
        return { training_center_id: center.id, ...toResponse(center) };
    }

    #presentCourse(course) {
        return {
            course_id: course.id,
            center_id: course.center_id,
            title: course.title,
            duration_type: course.duration_type,
            start_date: course.start_date,
            end_date: course.end_date,
            mode: course.mode,
            certificate_output: course.certificate_output,
            description: course.description,
            created_at: course.created_at instanceof Date ? course.created_at.toISOString() : course.created_at,
        };
    }

    async listMyCourses(userId) {
        const center = await this.findMine(userId);
        if (!center) throw new NotFoundException('Create a training center profile first');
        const rows = await connection('courses').where('center_id', center.id).whereNull('deleted_at').orderBy('created_at', 'desc');
        return { total: rows.length, data: rows.map(c => this.#presentCourse(c)) };
    }

    async listCourses({ page = 1, limit = 20, centerId } = {}) {
        const base = connection('courses').whereNull('deleted_at');
        if (centerId) base.where('center_id', centerId);
        const totalRow = await base.clone().count({ count: '*' }).first();
        const rows = await base.clone()
            .orderBy('created_at', 'desc')
            .limit(limit).offset((Math.max(1, page) - 1) * limit);
        return { total: Number(totalRow?.count || 0), data: rows.map(c => this.#presentCourse(c)) };
    }

    async getCourse(courseId) {
        const course = await connection('courses').where('id', courseId).whereNull('deleted_at').first();
        if (!course) throw new NotFoundException('Không tìm thấy khóa học');
        return this.#presentCourse(course);
    }

    async #assertCourseOwner(userId, courseId) {
        const center = await this.findMine(userId);
        if (!center) throw new ForbiddenException('Bạn chưa có trung tâm đào tạo');
        const course = await connection('courses').where('id', courseId).whereNull('deleted_at').first();
        if (!course) throw new NotFoundException('Không tìm thấy khóa học');
        if (course.center_id !== center.id) throw new ForbiddenException('Bạn không có quyền với khóa học này');
        return course;
    }

    async updateCourse(userId, courseId, body) {
        await this.#assertCourseOwner(userId, courseId);
        const patch = {};
        if (body.title !== undefined) patch.title = body.title;
        if (body.durationType !== undefined) patch.duration_type = body.durationType;
        if (body.startDate !== undefined) patch.start_date = body.startDate;
        if (body.endDate !== undefined) patch.end_date = body.endDate;
        if (body.mode !== undefined) patch.mode = body.mode;
        if (body.certificateOutput !== undefined) patch.certificate_output = body.certificateOutput;
        if (body.description !== undefined) patch.description = body.description;
        if (!Object.keys(patch).length) throw new BadRequestException('Không có trường nào để cập nhật');
        patch.updated_at = new Date();
        await connection('courses').where('id', courseId).update(patch);
        return { status: 'success', message: 'Cập nhật khóa học thành công', updated_at: patch.updated_at.toISOString() };
    }

    async deleteCourse(userId, courseId) {
        await this.#assertCourseOwner(userId, courseId);
        await connection('courses').where('id', courseId).update({ deleted_at: new Date(), updated_at: new Date() });
        return { status: 'success', message: 'Đã xóa khóa học', deleted_at: new Date().toISOString() };
    }

    async listCourseSkills(courseId) {
        const rows = await connection('course_skills').where('course_id', courseId).orderBy('created_at', 'asc');
        return {
            course_id: courseId,
            data: rows.map(s => ({ skill_id: s.id, name: s.name, type: s.type })),
        };
    }

    async addCourseSkills(userId, courseId, skills = []) {
        await this.#assertCourseOwner(userId, courseId);
        if (!skills.length) throw new BadRequestException('Danh sách skills là bắt buộc');
        const rows = skills
            .map(s => (typeof s === 'string' ? { name: s, type: 'hard' } : { name: s.name, type: s.type || 'hard' }))
            .filter(s => s.name)
            .map(s => ({ course_id: courseId, name: s.name, type: s.type }));
        if (rows.length) await connection('course_skills').insert(rows);
        return { course_id: courseId, added: rows.length, message: 'Gan skill thanh cong' };
    }

    async removeCourseSkill(userId, courseId, skillId) {
        await this.#assertCourseOwner(userId, courseId);
        await connection('course_skills').where({ id: skillId, course_id: courseId }).delete();
        return { status: 'success', message: 'Da go skill khoi khoa hoc', deleted_at: new Date().toISOString() };
    }
}

export const TrainingService = new TrainingServiceClass();
