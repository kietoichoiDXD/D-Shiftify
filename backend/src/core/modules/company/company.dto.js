import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('UpsertCompanyDto', {
    name: SwaggerDocument.ApiProperty({ type: 'string' }),
    slogan: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    phone: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    email: SwaggerDocument.ApiProperty({ type: 'string' }),
    website: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    industry: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    taxCode: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    address: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    policyForDisabled: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    experienceWithDisabled: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    licenseFile: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    logoUrl: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
});

export const UpsertCompanyDto = body => ({
    name: body.name,
    slogan: body.slogan || null,
    phone: body.phone || null,
    email: body.email,
    website: body.website || null,
    industry: body.industry || null,
    tax_code: body.taxCode || null,
    address: body.address || null,
    policy_for_disabled: body.policyForDisabled || null,
    experience_with_disabled: body.experienceWithDisabled || null,
    license_file: body.licenseFile || null,
    logo_url: body.logoUrl || null,
});
