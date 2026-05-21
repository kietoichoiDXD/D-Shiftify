import { Server } from 'socket.io';
import { JwtService } from 'core/utils';
import { ChatService, SendMessageSchema } from 'core/modules/chat';
import { TokenRevocationService } from 'core/modules/auth/service/token-revocation.service';
import { logger } from 'packages/logger';
import { CORS_ORIGIN } from './env';

const extractToken = socket => {
    const authToken = socket.handshake.auth?.token;
    const headerToken = socket.handshake.headers?.authorization;
    const token = authToken || headerToken;
    return token?.startsWith('Bearer ') ? token.slice(7) : token;
};

const authenticateSocket = async (socket, next) => {
    try {
        const token = extractToken(socket);
        if (!token) return next(new Error('Unauthorized'));

        if (await TokenRevocationService.isRevoked(token)) {
            return next(new Error('Unauthorized'));
        }

        const payload = JwtService.verify(token);
        if (!payload?.id) return next(new Error('Unauthorized'));

        socket.data.userId = payload.id;
        socket.data.roles = payload.roles || [];
        return next();
    } catch (error) {
        logger.error(error.message);
        return next(new Error('Unauthorized'));
    }
};

const normalizeSocketError = error => ({
    message: error?.message || 'Socket error',
});

export const initSocket = server => {
    const io = new Server(server, {
        cors: {
            origin: CORS_ORIGIN,
            methods: ['GET', 'POST'],
        },
    });

    io.use(authenticateSocket);

    io.on('connection', socket => {
        socket.on('join_room', async (roomId, ack) => {
            try {
                await ChatService.joinRoom(roomId, socket.data.userId);
                socket.join(roomId);
                if (ack) ack({ joined: true, roomId });
            } catch (error) {
                logger.error(error.message);
                if (ack) ack({ error: normalizeSocketError(error) });
                socket.emit('socket_error', normalizeSocketError(error));
            }
        });

        socket.on('send_message', async (payload, ack) => {
            try {
                const data = SendMessageSchema.parse(payload);
                const message = await ChatService.sendMessage(data, socket.data.userId);
                io.to(data.roomId).emit('receive_message', message);
                if (ack) ack({ sent: true, message });
            } catch (error) {
                logger.error(error.message);
                if (ack) ack({ error: normalizeSocketError(error) });
                socket.emit('socket_error', normalizeSocketError(error));
            }
        });
    });

    return io;
};
