import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';

class Controller {
    status = async () => ValidHttpResponse.toOkResponse({
        service: 'Shiftify Backend',
        status: 'ok',
        message: 'Frontend can connect to backend successfully',
        timestamp: new Date().toISOString(),
    });
}

export const FrontendController = new Controller();
