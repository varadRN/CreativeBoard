import { useEffect } from 'react';
import { socketClient } from '@/lib/collaboration/socketClient';
import { useCollaborationStore } from '@/stores/collaborationStore';

export const usePresence = (boardId: string) => {
    const { setActiveUsers, setCurrentUserColor, activeUsers } = useCollaborationStore();

    useEffect(() => {
        const socket = socketClient.getSocket();
        if (!socket || !boardId) return;

        const handleActiveUsers = (users: any[]) => {
            setActiveUsers(users);
        };

        const handleMyPresence = (me: any) => {
            setCurrentUserColor(me.color);
        };

        socket.on('active-users', handleActiveUsers);
        socket.on('my-presence', handleMyPresence);

        return () => {
            socket.off('active-users', handleActiveUsers);
            socket.off('my-presence', handleMyPresence);
        };
    }, [boardId, setActiveUsers, setCurrentUserColor]);

    return { activeUsers };
};
