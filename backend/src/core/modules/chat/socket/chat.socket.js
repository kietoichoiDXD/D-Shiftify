    import { Server } from 'socket.io';
    import { SOCKET_EVENTS } from './socket.events';
    import { socketAuthInterceptor, JoinConversationInterceptor,JoinConversationSchema ,  CreateMessageInterceptor , CreateMessageSchema } from '../interceptor';
    import { ParticipantsRepository } from '../repositories/participant.repository';
    import { SocketService } from '../services/socket.service';
    import { MESSAGE } from '../services/message.enum.js';

    let io = null;

    export const initializeChatGateway  = httpServer => {

        io = new Server(httpServer, { cors: { origin: '*' } });

        io.use(socketAuthInterceptor);

        io.on(SOCKET_EVENTS.CONNECTION, socket => {

            socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, async payload => {
                try {
                    const { error } = JoinConversationSchema.validate(payload);

                    if (error) {
                        return socket.emit(SOCKET_EVENTS.ERROR, {
                            message: error.message,
                        });
                    }
                    const participant = await ParticipantsRepository.findParticipant(
                        payload.conversationId,
                        socket.user.id
                    );

                    if (!participant) {
                        return socket.emit(SOCKET_EVENTS.ERROR, {
                            message: MESSAGE.FORBIDDEN,
                        });
                    }

                    socket.join(payload.conversationId);

                    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION_SUCCESS, {
                        conversationId: payload.conversationId,
                    });

                } catch (error) {
                    socket.emit(SOCKET_EVENTS.ERROR, {
                        message: error.message,
                    });
                }
            });

            socket.on(SOCKET_EVENTS.SEND_MESSAGE, async payload => {
                try {
                    const { error } = CreateMessageSchema.validate(payload);

                    if (error) {
                        return socket.emit(SOCKET_EVENTS.ERROR, {
                            message: error.message,
                        });
                    }
                    await SocketService.sendMessage(io, socket, payload);
                } catch (error) {
                    socket.emit(SOCKET_EVENTS.ERROR, {
                        message: error.message,
                    });
                }
            });

            const callRoomOf = roomId => `call:${roomId}`;

            socket.on(SOCKET_EVENTS.CALL_JOIN, payload => {
                try {
                    const roomId = payload?.roomId;
                    if (!roomId) {
                        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'roomId is required to join a call' });
                    }
                    const room = callRoomOf(roomId);
                    const peers = io.sockets.adapter.rooms.get(room);
                    const peerCount = peers ? peers.size : 0;

                    if (peerCount >= 2) {
                        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Call room is full' });
                    }

                    socket.join(room);
                    socket.data.callRoom = room;

                    socket.emit(SOCKET_EVENTS.CALL_READY, { roomId, shouldOffer: peerCount === 1 });

                    socket.to(room).emit(SOCKET_EVENTS.CALL_PEER_JOINED, { userId: socket.user?.id });
                } catch (error) {
                    socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
                }
            });

            socket.on(SOCKET_EVENTS.CALL_SIGNAL, payload => {
                const room = socket.data.callRoom;
                if (!room || !payload?.data) return;
                socket.to(room).emit(SOCKET_EVENTS.CALL_SIGNAL, { data: payload.data, from: socket.user?.id });
            });

            const leaveCall = () => {
                const room = socket.data.callRoom;
                if (!room) return;
                socket.to(room).emit(SOCKET_EVENTS.CALL_PEER_LEFT, { userId: socket.user?.id });
                socket.leave(room);
                socket.data.callRoom = null;
            };

            socket.on(SOCKET_EVENTS.CALL_LEAVE, leaveCall);
            socket.on(SOCKET_EVENTS.DISCONNECT, leaveCall);
        });

        return io;
    };

    export const getIO = () => {

        if (!io) {
            throw new Error(MESSAGE.SOCKET_NOT_INITIALIZED);
        }

        return io;
    };
