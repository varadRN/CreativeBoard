import { useEffect } from 'react';
import { socketClient } from '@/lib/collaboration/socketClient';
import { useAuthStore } from '@/stores/authStore';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { toast } from 'sonner';

export const useWebSocket = (boardId: string) => {
    const { token, user, loginAsGuest } = useAuthStore();
    const {
        setIsConnected,
        setConnectionStatus
    } = useCollaborationStore();

    useEffect(() => {
        if (!boardId) return;

        // If not authenticated and no guest session, create one
        if (!token && !user) {
            loginAsGuest();
            return;
        }

        // Wait for user to be set (either auth or guest)
        if (!user) return;

        setConnectionStatus('connecting');

        const guestInfo = user.isGuest ? {
            guestId: user.id,
            guestName: user.fullName
        } : undefined;

        const socket = socketClient.connect(token || undefined, guestInfo);

        const onConnect = () => {
            console.log("Socket connected, joining board:", boardId);
            setIsConnected(true);
            setConnectionStatus('connected');

            // Join methods
            socket.emit('join-board', boardId, (response: any) => {
                console.log('Join-board response:', response);
            });
            socket.emit('join-presence', {
                boardId,
                user: {
                    fullName: user.fullName, // Remove optional chaining if user is guaranteed
                    avatarUrl: user.avatarUrl,
                    id: user.id,
                    isGuest: !!user.isGuest // Ensure boolean
                }
            });
        };

        const onDisconnect = (reason: any) => {
            console.log("Socket disconnected:", reason);
            setIsConnected(false);
            setConnectionStatus('disconnected');
        };

        const onConnectError = async (err: Error) => {
            console.warn("Socket connection error:", err.message);
            setConnectionStatus('reconnecting');

            // If auth error, try to refresh token via getMe (which uses api interceptor)
            if (err.message.includes('Authentication error') || err.message.includes('jwt expired')) {
                console.log("Attempting to refresh auth token...");
                await useAuthStore.getState().getMe();
                // If getMe fails, it will logout and user/token will become null, 
                // preventing infinite loop of guest checks if not intended.
            }
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

        // If already connected, trigger manually
        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.emit('leave-board', boardId);
        };
    }, [boardId, token, user, loginAsGuest, setIsConnected, setConnectionStatus]);
};
