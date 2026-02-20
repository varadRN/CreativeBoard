import { Server, Socket } from 'socket.io';
import { throttle } from 'lodash';

// In-memory cursor storage (optional, for persistence if needed, but usually ephemeral)
// We just broadcast for now.

export const handleCursor = (io: Server, socket: Socket) => {
    // Throttle broadcast to limit bandwidth
    // Since we can't easily throttle per-socket inside the 'on' handler without
    // creating a throttled function per socket instance, we'll assume client throttles too.
    // But strictly, we should broadcast immediately if client throttles.

    socket.on('cursor-move', (data: { boardId: string, x: number, y: number, userName: string, color: string }) => {
        const { boardId, x, y, userName, color } = data;
        const userId = socket.data.user?.id;

        if (!boardId || !userId) return;

        socket.to(boardId).emit('cursor-updated', {
            userId,
            x,
            y,
            userName,
            color,
            socketId: socket.id
        });
    });
};
