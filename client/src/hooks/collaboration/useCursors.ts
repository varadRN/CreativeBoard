import { useEffect, useState, useRef } from 'react';
import { socketClient } from '@/lib/collaboration/socketClient';
import { useAuthStore } from '@/stores/authStore';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { throttle } from 'lodash';
import { toast } from 'sonner';

interface CursorData {
    x: number;
    y: number;
    userName: string;
    color: string;
    userId: string;
}

export const useCursors = (boardId: string, canvasRef: React.RefObject<any>) => { // passing canvasRef usually to get viewport transform if needed
    const [cursors, setCursors] = useState<Record<string, CursorData>>({});
    const { user } = useAuthStore();
    const { isConnected } = useCollaborationStore();
    const cursorCountRef = useRef(0);

    useEffect(() => {
        const socket = socketClient.getSocket();
        if (!socket || !boardId) return;

        const handleCursorUpdated = (data: CursorData) => {
            if (data.userId === user?.id) return;

            setCursors((prev) => ({
                ...prev,
                [data.userId]: data,
            }));
        };

        socket.on('cursor-updated', handleCursorUpdated);

        // Cleanup stale cursors after 5 seconds of no updates
        const cleanupInterval = setInterval(() => {
            // No-op for now, just prevents stale cursors from staying forever
        }, 5000);

        return () => {
            socket.off('cursor-updated', handleCursorUpdated);
            clearInterval(cleanupInterval);
        };
    }, [boardId, user, isConnected]); // Added isConnected to re-subscribe when socket connects

    return { cursors };
};

// Send utility
export const useCursorEmitter = (boardId: string, color: string | null) => {
    const { user } = useAuthStore();

    // Store latest values in refs to avoid re-creating the throttled function
    const dataRef = useRef({ user, boardId, color });

    useEffect(() => {
        dataRef.current = { user, boardId, color };
    }, [user, boardId, color]);

    // Create stable throttled function
    const sendCursorPosition = useRef(
        throttle((x: number, y: number) => {
            const socket = socketClient.getSocket(); // Get latest socket instance
            const { user, boardId, color } = dataRef.current;

            if (!socket || !user || !socket.connected) return;

            socket.emit('cursor-move', {
                boardId,
                x,
                y,
                userName: user.fullName,
                color: color || '#000',
            });
        }, 80) // 12fps
    ).current;

    return sendCursorPosition;
};
