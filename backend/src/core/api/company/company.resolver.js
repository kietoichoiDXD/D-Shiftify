import { Module } from 'packages/handler/Module';
import { hasRecruiterRole } from 'core/modules/auth/guard/role.manager';
import { UpsertCompanyInterceptor } from 'core/modules/company/company.interceptor';
import 'core/modules/company/company.dto';
import { CompanyController } from './company.controller';

export const CompanyResolver = Module.builder()
    .addPrefix({ prefixPath: '/company', tag: 'company', module: 'CompanyModule' })
    .register([
        { route: '/me', method: 'get', controller: CompanyController.getMine, preAuthorization: true, guards: [hasRecruiterRole] },
        { route: '/me', method: 'put', body: 'UpsertCompanyDto', interceptors: [UpsertCompanyInterceptor], controller: CompanyController.upsertMine, preAuthorization: true, guards: [hasRecruiterRole] },
    ]);
