import { create } from 'zustand';
import { api } from '../lib/api';
import { User, LoginResponse, AuthResponse } from '../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    getMe: () => Promise<void>;
    loginAsGuest: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('accessToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false, // No need to load if we have local data

    login: async (credentials) => {
        // Do not set global isLoading to true, as it unmounts the router
        try {
            console.log('[DEBUG-CLIENT] Login credentials:', { ...credentials, password: '***' });
            const response = await api.post<LoginResponse>('/auth/login', credentials);
            const { user, accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (data) => {
        // Do not set global isLoading to true
        try {
            await api.post('/auth/register', data);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('guestUser');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    getMe: async () => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                // Check if we have a guest session
                const guestStored = sessionStorage.getItem('guestUser');
                if (guestStored) {
                    const guestUser = JSON.parse(guestStored);
                    set({ user: guestUser, token: null, isAuthenticated: false, isLoading: false });
                    return;
                }

                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                return;
            }

            const response = await api.get<AuthResponse>('/auth/me');
            set({ user: response.data.data as any, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
            localStorage.removeItem('accessToken');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },

    loginAsGuest: () => {
        const guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
        const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const guestUser: User = {
            id: guestId,
            email: `${guestId}@guest.com`,
            fullName: 'Guest User',
            emailVerified: false,
            isGuest: true,
            createdAt: new Date().toISOString(),
            color: randomColor
        };
        localStorage.setItem('user', JSON.stringify(guestUser));
        sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
        set({ user: guestUser, isAuthenticated: true, isLoading: false });
    },

    setUser: (user) => set({ user, isAuthenticated: !!user && !user.isGuest }),
}));
