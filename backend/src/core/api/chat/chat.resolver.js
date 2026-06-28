import { Module } from 'packages/handler/Module';
import { ChatController } from './chat.controller';

export const ChatResolver = Module.builder()
    .addPrefix({

        prefixPath: '/chat',
        tag: 'chat',
        module: 'ChatModule',
    })
    .register([

        {
            route: '/conversations',
            method: 'post',
            body: 'CreateConversationDto',
            controller: ChatController.createConversation,
            preAuthorization: true,
        },
        {
            route: '/conversations',
            method: 'get',
            controller: ChatController.getConversationsbyId,
            preAuthorization: true,
        },
        {
            route: '/conversations/:id',
            method: 'get',
            controller: ChatController.getConversationById,
            preAuthorization: true,
        },
        {
            route: '/conversations/:id',
            method: 'delete',
            controller: ChatController.deleteConversation,
            preAuthorization: true,
        },
        {
            route: '/conversations/:id/read',
            method: 'patch',
            controller: ChatController.markRead,
            preAuthorization: true,
        },

        {
            route: '/conversations/:id/participants',
            method: 'get',
            controller: ChatController.getParticipants,
            preAuthorization: true,
        },
        {
            route: '/conversations/:id/participants',
            method: 'post',
            body: 'AddParticipantsDto',
            controller: ChatController.addParticipants,
            preAuthorization: true,
        },
        {
            route: '/conversations/:id/participants',
            method: 'delete',
            body: 'RemoveParticipantDto',
            controller: ChatController.removeParticipant,
            preAuthorization: true,
        },

        {
            route: '/conversations/:id/messages',
            method: 'post',
            body: 'CreateMessageDto',
            controller: ChatController.createMessage,
            preAuthorization: true,
        },
        {
            route: '/conversations/:id/messages',
            method: 'get',
            controller: ChatController.getMessages,
            preAuthorization: true,
        },
        {
            route: '/messages/:messageId',
            method: 'get',
            controller: ChatController.getMessageById,
            preAuthorization: true,
        },
        {
            route: '/messages/:messageId',
            method: 'patch',
            body: 'UpdateMessageDto',
            controller: ChatController.updateMessage,
            preAuthorization: true,
        },
        {
            route: '/messages/:messageId',
            method: 'delete',
            controller: ChatController.deleteMessage,
            preAuthorization: true,
        },
    ]);
