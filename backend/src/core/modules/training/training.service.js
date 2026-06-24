import connection, { getTransaction } from 'core/database';
import { NotFoundException } from 'packages/httpException';

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
}

export const TrainingService = new TrainingServiceClass();
