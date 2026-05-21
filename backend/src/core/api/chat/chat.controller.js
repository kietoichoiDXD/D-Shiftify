import { getUserContext } from 'packages/authModel/module/user';
import { ChatService } from 'core/modules/chat';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';

class Controller {
    constructor() {
        this.service = ChatService;
    }

    getRooms = async req => {
        const { id } = getUserContext(req);
        const rooms = await this.service.getRooms(id);
        return ValidHttpResponse.toOkResponse(rooms);
    };

    getMessages = async req => {
        const { id } = getUserContext(req);
        const messages = await this.service.getMessages(req.params.roomId, id, req.query);
        return ValidHttpResponse.toOkResponse(messages);
    };
}

export const ChatController = new Controller();
