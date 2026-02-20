import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { socketAuth } from './socketAuth';
import { handleBoardRoom } from './boardRoom';
import { handleCursor } from './cursorHandler';
import { handleCanvas } from './canvasHandler';
import { handlePresence } from './presenceHandler';
import { Logger } from '../utils/logger';

export let io: Server;

export const initSocketServer = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    // Middleware
    io.use(socketAuth);

    io.on('connection', (socket: Socket) => {
        Logger.info(`User connected: ${socket.data.user?.id} (${socket.id})`);

        // Handlers
        handleBoardRoom(io, socket);
        handleCursor(io, socket);
        handleCanvas(io, socket);
        handlePresence(io, socket);

        socket.on('disconnect', () => {
            Logger.info(`User disconnected: ${socket.data.user?.id}`);
        });
    });

    return io;
};