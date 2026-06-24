import connection, { getTransaction } from 'core/database';
import { NotFoundException } from 'packages/httpException';
import { UpsertCompanyDto } from './company.dto';

const toResponse = company => ({
    id: company.id,
    name: company.name,
    slogan: company.slogan,
    phone: company.phone,
    email: company.email,
    website: company.website,
    industry: company.industry,
    taxCode: company.tax_code,
    address: company.address,
    policyForDisabled: company.policy_for_disabled,
    experienceWithDisabled: company.experience_with_disabled,
    licenseFile: company.license_file,
    logoUrl: company.logo_url,
});

class CompanyServiceClass {
    async getMine(userId) {
        const company = await connection('companies').where('user_id', userId).whereNull('deleted_at').first();
        if (!company) throw new NotFoundException('Company profile not found');
        return toResponse(company);
    }

    async upsertMine(userId, body) {
        const payload = UpsertCompanyDto(body);
        const existing = await connection('companies').where('user_id', userId).whereNull('deleted_at').first();
        const trx = await getTransaction();
        try {
            let result;
            if (existing) {
                [result] = await connection('companies').where('id', existing.id).update({ ...payload, updated_at: new Date() }).returning('*').transacting(trx);
            } else {
                [result] = await connection('companies').insert({ ...payload, user_id: userId }).returning('*').transacting(trx);
            }
            await trx.commit();
            return toResponse(result);
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}

export const CompanyService = new CompanyServiceClass();
