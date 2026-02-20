import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';
import { initSocketServer } from './websocket/socketServer';
import { Logger } from './utils/logger';
import { prisma } from './config/database';

const app = express();
const httpServer = createServer(app);

// --- Middleware ---

// Security headers
app.use(helmet());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// RESTORED CORS CONFIGURATION
app.use(cors({
    origin: env.CLIENT_URL, // Ensure this matches client URL (http://localhost:5173)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
}));

// Rate limiting for general API routes
app.use('/api', apiLimiter);

// DEBUG LOGGING MIDDLEWARE - MUST BE BEFORE ROUTES (BUT AFTER BODY PARSER)
app.use((req, res, next) => {
    console.log(`[INCOMING] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log(`[INCOMING BODY]`, JSON.stringify(req.body, null, 2).substring(0, 500));
    }
    next();
});

// --- Routes ---

// Root route
app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'CreativeBoard Server is running' });
});

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((_req, res, _next) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
    });
});

// Error Handling (Must be last)
app.use(errorHandler);

// --- Socket.io ---
const io = initSocketServer(httpServer);

// --- Server Startup ---
const PORT = env.PORT || 5000;

const server = httpServer.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
    Logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// --- Graceful Shutdown ---
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds

const shutdown = async () => {
    Logger.info('Shutting down server...');

    // Force exit if graceful shutdown takes too long
    const forceExitTimeout = setTimeout(() => {
        Logger.error('Forced shutdown due to timeout');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    try {
        // Close HTTP server (stop accepting new connections)
        await new Promise<void>((resolve) => {
            server.close(() => {
                Logger.info('HTTP server closed');
                resolve();
            });
        });

        // Close Socket.io server
        await new Promise<void>((resolve) => {
            io.close(() => {
                Logger.info('Socket.io server closed');
                resolve();
            });
        });

        // Disconnect database
        await prisma.$disconnect();
        Logger.info('Database disconnected');

        clearTimeout(forceExitTimeout);
        process.exit(0);
    } catch (err) {
        Logger.error('Error during shutdown', err);
        clearTimeout(forceExitTimeout);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);



export default app;