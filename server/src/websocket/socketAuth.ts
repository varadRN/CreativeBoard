import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { Logger } from '../utils/logger';

export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        const guestId = socket.handshake.auth.guestId;
        const guestName = socket.handshake.auth.guestName;

        if (token) {
            try {
                const decoded = verifyAccessToken(token);
                if (decoded) {
                    socket.data.user = { id: decoded.userId };
                    return next();
                }
            } catch (err) {
                // Token invalid/expired? Log and fall through to guest check
                console.warn(`[SocketAuth] Token verification failed, attempting guest fallback:`, err);
            }
        }

        // Fallback to guest if no valid token
        if (guestId && guestName) {
            socket.data.user = {
                id: guestId,
                name: guestName,
                isGuest: true
            };
            return next();
        }

        return next(new Error('Authentication error: No token or guest credentials'));
    } catch (error) {
        Logger.error('Socket authentication failed', error);
        next(new Error('Authentication error'));
    }
};