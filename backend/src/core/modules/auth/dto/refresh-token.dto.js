import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('RefreshTokenDto', {
    refreshToken: SwaggerDocument.ApiProperty({ type: 'string' }),
});

export const RefreshTokenDto = body => ({
    refreshToken: body.refreshToken,
});
