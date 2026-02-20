import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/config/env';

class SocketClient {
    private static instance: SocketClient;
    public socket: Socket | null = null;

    private constructor() { }

    public static getInstance(): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient();
        }
        return SocketClient.instance;
    }

    public connect(token?: string, guestInfo?: { guestId: string; guestName: string }): Socket {
        if (this.socket?.connected) return this.socket;

        if (this.socket) {
            this.socket.disconnect();
        }

        const auth: any = {};
        if (token) auth.token = token;
        if (guestInfo) {
            auth.guestId = guestInfo.guestId;
            auth.guestName = guestInfo.guestName;
        }

        this.socket = io(WS_URL, {
            auth,
            transports: ['websocket'], // Force websocket only
            reconnection: true,
            reconnectionAttempts: 20,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('Socket disconnected:', reason);
        });

        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }
}

export const socketClient = SocketClient.getInstance();
