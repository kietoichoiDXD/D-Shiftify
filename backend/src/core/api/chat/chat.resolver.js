import { CreateRoomInterceptor, MessageHistoryQueryInterceptor, RoomIdParamInterceptor } from 'core/modules/chat';
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
            route: '/rooms',
            method: 'get',
            controller: ChatController.getRooms,
            preAuthorization: true,
        },
        {
            route: '/rooms',
            method: 'post',
            interceptors: [CreateRoomInterceptor],
            controller: ChatController.createRoom,
            preAuthorization: true,
        },
        {
            route: '/rooms/:roomId/messages',
            method: 'get',
            interceptors: [RoomIdParamInterceptor, MessageHistoryQueryInterceptor],
            controller: ChatController.getMessages,
            preAuthorization: true,
        },
    ]);
