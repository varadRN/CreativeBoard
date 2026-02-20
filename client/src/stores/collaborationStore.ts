import { create } from 'zustand';

interface User {
    userId: string;
    fullName: string;
    avatarUrl?: string;
    color: string;
    socketId: string;
}

interface CollaborationState {
    isConnected: boolean;
    connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
    activeUsers: User[];
    currentUserColor: string | null;

    setIsConnected: (status: boolean) => void;
    setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting') => void;
    setActiveUsers: (users: User[]) => void;
    setCurrentUserColor: (color: string) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
    isConnected: false,
    connectionStatus: 'disconnected',
    activeUsers: [],
    currentUserColor: null,

    setIsConnected: (status) => set({ isConnected: status }),
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setActiveUsers: (users) => set({ activeUsers: users }),
    setCurrentUserColor: (color) => set({ currentUserColor: color }),
}));
