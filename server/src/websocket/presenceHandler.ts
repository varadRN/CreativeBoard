import { Server, Socket } from 'socket.io';

const PRESENCE_COLORS = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#EC4899', // pink-500
    '#8B5CF6', // violet-500
    '#6366F1', // indigo-500
    '#EF4444', // red-500
    '#14B8A6', // teal-500
];

interface UserPresence {
    userId: string;
    socketId: string;
    fullName: string; // We need this from somewhere, currently maybe passed from client or fetched
    avatarUrl?: string; // Same
    color: string;
    joinedAt: number;
}

// In-memory store for board presence: boardId -> UserPresence[]
const boardPresence = new Map<string, UserPresence[]>();

export const handlePresence = (io: Server, socket: Socket) => {
    const userId = socket.data.user?.id;

    // We need user details. For now, client sends them on join-board-presence or similar
    socket.on('join-presence', (data: { boardId: string, user: { fullName: string, avatarUrl?: string } }) => {
        if (!userId || !data.boardId) return;

        const currentBoardUsers = boardPresence.get(data.boardId) || [];

        // Assign random color not used if possible, or just random
        const color = PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];

        const presence: UserPresence = {
            userId,
            socketId: socket.id,
            fullName: data.user.fullName,
            avatarUrl: data.user.avatarUrl,
            color,
            joinedAt: Date.now()
        };

        // Remove existing entry for this user if any (handle reconnects)
        const filtered = currentBoardUsers.filter(u => u.userId !== userId);
        filtered.push(presence);
        boardPresence.set(data.boardId, filtered);

        // Broadcast full list to everyone in room including sender
        io.to(data.boardId).emit('active-users', filtered);

        // Also emit current user's assigned color back to them so they know their own color
        socket.emit('my-presence', presence);
    });

    socket.on('disconnect', () => {
        const boardId = socket.data.boardId;
        if (boardId) {
            const users = boardPresence.get(boardId) || [];
            const remaining = users.filter(u => u.socketId !== socket.id); // Filter by socketId to support multiple tabs

            if (remaining.length === 0) {
                boardPresence.delete(boardId);
            } else {
                boardPresence.set(boardId, remaining);
                io.to(boardId).emit('active-users', remaining);
            }
        }
    });

    // Clean up on leave-board too
    socket.on('leave-board', (boardId: string) => {
        const users = boardPresence.get(boardId) || [];
        const remaining = users.filter(u => u.socketId !== socket.id);
        if (remaining.length === 0) {
            boardPresence.delete(boardId);
        } else {
            boardPresence.set(boardId, remaining);
            io.to(boardId).emit('active-users', remaining);
        }
    });
};
