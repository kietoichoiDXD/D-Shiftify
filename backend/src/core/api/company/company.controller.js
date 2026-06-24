import { getUserContext } from 'packages/authModel/module/user';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { CompanyService } from 'core/modules/company/company.service';

class CompanyControllerClass {
    getMine = async req => {
        const data = await CompanyService.getMine(getUserContext(req).payload.id);
        return ValidHttpResponse.toOkResponse({ status: 'success', data });
    };

    upsertMine = async req => {
        const data = await CompanyService.upsertMine(getUserContext(req).payload.id, req.body);
        return ValidHttpResponse.toOkResponse({ status: 'success', data });
    };
}

export const CompanyController = new CompanyControllerClass();
