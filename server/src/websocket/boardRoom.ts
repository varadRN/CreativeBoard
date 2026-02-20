import { Server, Socket } from 'socket.io';
import { Logger } from '../utils/logger';

export const handleBoardRoom = (io: Server, socket: Socket) => {
    socket.on('join-board', async (boardId: string, callback?: (response: any) => void) => {
        try {
            console.log(`[SERVER] Received join-board request for ${boardId} from socket ${socket.id}`);
            if (!boardId) {
                console.error('[SERVER] join-board failed: No boardId');
                if (callback) callback({ error: 'No boardId' });
                return;
            }

            const userId = socket.data.user?.id;
            console.log(`[SERVER] User ${userId} joining board ${boardId}`);

            await socket.join(boardId);

            // Store boardId in socket data for disconnect handling
            socket.data.boardId = boardId;

            // Broadcast to others in room
            socket.to(boardId).emit('user-joined', {
                userId,
                socketId: socket.id
            });

            console.log(`[SERVER] User ${userId} successfully joined room ${boardId}`);

            if (callback) callback({ success: true, message: `Joined board ${boardId}` });

        } catch (error) {
            console.error('[SERVER] Error joining board room', error);
            if (callback) callback({ error: 'Internal server error' });
        }
    });

    socket.on('leave-board', (boardId: string) => {
        Logger.info(`User ${socket.data.user?.id} leaving board ${boardId}`);
        socket.leave(boardId);
        socket.data.boardId = null;
        io.to(boardId).emit('user-left', { userId: socket.data.user?.id });
    });
};