import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../config/database';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
            };
        }
    }
}

// ... existing code ...

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('No token provided'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = { userId: payload.userId };
        next();
    } catch (error) {
        next(new UnauthorizedError('Invalid or expired token'));
    }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // No token, proceed as guest
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = { userId: payload.userId };
        next();
    } catch (error) {
        // Token invalid/expired - proceed as guest or throw?
        // Better to proceed as guest, client can handle auth errors if they intended to be logged in
        next();
    }
};
