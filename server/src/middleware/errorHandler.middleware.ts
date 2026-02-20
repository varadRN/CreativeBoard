import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { Logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;

    if (!(error instanceof AppError)) {
        Logger.error('Unhandled Error:', error);
        error = new AppError('Internal Server Error', 500);
    }

    const statusCode = (error as AppError).statusCode || 500;
    const message = error.message || 'Something went wrong';

    // Log operational errors
    if (error instanceof AppError && error.isOperational) {
        Logger.error(`[${statusCode}] ${req.method} ${req.url} - ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
