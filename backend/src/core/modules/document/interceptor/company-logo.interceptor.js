import { ROOT_DIR } from 'core/env';
import { BaseMulterInterceptor } from './multer.interceptor';
import { MulterUploader } from '../multer.handler';

export class CompanyLogoInterceptor extends BaseMulterInterceptor {
    constructor() {
        super(new MulterUploader(
            ['.png', '.jpg', '.jpeg', '.webp'],
            'logo',
            1,
            `${ROOT_DIR}/core/uploads/company-logos`
        ));
    }
}
