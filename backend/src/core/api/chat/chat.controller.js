import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response';
import { getUserContext } from '../../../packages/authModel/module/user';
import { ConversationService } from 'core/modules/chat/services/conversation.service';
import { MessageService } from 'core/modules/chat/services/message.service';
import {
    CreateConversationDto,
    AddParticipantsDto,
    RemoveParticipantDto,
    UpdateMessageDto,
} from 'core/modules/chat/dto';
import {
    presentMessage,
    presentMessageCreated,
    presentMessagesPage,
    presentParticipantsList,
    presentConversationDetail,
    presentConversationList,
} from './chat.presenter';

const iso = value => (value instanceof Date ? value.toISOString() : value ?? null);

class Controller {
    constructor() {
        this.conversationService = ConversationService;
        this.messageService = MessageService;
    }

    createConversation = async req => {
        const userId = getUserContext(req).payload.id;
        const { participantIds } = CreateConversationDto(req.body);
        const conv = await this.conversationService.createConversation(userId, participantIds);
        return ValidHttpResponse.toCreatedResponse({
            conversation_id: conv.id,
            created_at: iso(conv.createdAt),
            message: 'Tao cuoc hoi thoai thanh cong',
        });
    };

    getConversationsbyId = async req => {
        const userId = getUserContext(req).payload.id;
        const { page, limit, search } = req.query || {};
        const { total, items } = await this.conversationService.getUserConversations(userId, {
            page: Number(page) || 1,
            limit: Number(limit) || 20,
            search: search || '',
        });
        return ValidHttpResponse.toOkResponse(presentConversationList(items, total));
    };

    getConversationById = async req => {
        const userId = getUserContext(req).payload.id;
        const conv = await this.conversationService.getConversationById(req.params.id, userId);
        return ValidHttpResponse.toOkResponse(presentConversationDetail(conv));
    };

    deleteConversation = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await this.conversationService.deleteConversation(req.params.id, userId);
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Da xoa cuoc hoi thoai',
            deleted_at: iso(data.deletedAt),
        });
    };

    markRead = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await this.conversationService.markRead(
            req.params.id,
            userId,
            req.body?.last_read_message_id || req.body?.lastReadMessageId
        );
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            conversation_id: data.conversationId,
            unread_count: data.unreadCount,
            updated_at: iso(data.updatedAt),
        });
    };

    getParticipants = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await this.conversationService.getParticipants(req.params.id, userId);
        return ValidHttpResponse.toOkResponse(presentParticipantsList(data));
    };

    addParticipants = async req => {
        const userId = getUserContext(req).payload.id;
        const { userIds } = AddParticipantsDto(req.body);
        const data = await this.conversationService.addParticipants(req.params.id, userId, userIds);
        const firstAdded = data.addedUserIds[0];
        return ValidHttpResponse.toCreatedResponse({
            participant_id: firstAdded ? `${data.conversationId}:${firstAdded}` : null,
            conversation_id: data.conversationId,
            message: 'Them participant thanh cong',
        });
    };

    removeParticipant = async req => {
        const userId = getUserContext(req).payload.id;
        const { userId: targetUserId } = RemoveParticipantDto({ ...req.params, ...req.body });
        const data = await this.conversationService.removeParticipant(req.params.id, userId, targetUserId);
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Da xoa participant',
            deleted_at: iso(data.deletedAt),
        });
    };

    createMessage = async req => {
        const userId = getUserContext(req).payload.id;
        const message = await this.messageService.createMessage(
            {
                conversationId: req.params.id,
                content: req.body.content,
                voiceUrl: req.body.voiceUrl ?? req.body.voice_url,
            },
            userId
        );
        return ValidHttpResponse.toCreatedResponse(presentMessageCreated(message));
    };

    getMessages = async req => {
        const userId = getUserContext(req).payload.id;
        const { cursor, limit } = req.query || {};
        const { messages, nextCursor } = await this.messageService.getMessages(req.params.id, userId, {
            cursor: cursor || null,
            limit: Number(limit) || 30,
        });
        return ValidHttpResponse.toOkResponse(presentMessagesPage(messages, nextCursor));
    };

    getMessageById = async req => {
        const userId = getUserContext(req).payload.id;
        const message = await this.messageService.getMessageById(req.params.messageId, userId);
        return ValidHttpResponse.toOkResponse(presentMessage(message));
    };

    updateMessage = async req => {
        const userId = getUserContext(req).payload.id;
        const updated = await this.messageService.updateMessage(
            req.params.messageId,
            userId,
            UpdateMessageDto(req.body)
        );
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Cap nhat tin nhan thanh cong',
            updated_at: iso(updated.updatedAt),
        });
    };

    deleteMessage = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await this.messageService.deleteMessage(req.params.messageId, userId);
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Da xoa tin nhan',
            deleted_at: iso(data.deletedAt),
        });
    };
}

export const ChatController = new Controller();
