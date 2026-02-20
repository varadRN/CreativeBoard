import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // Limit each IP to 50 requests per windowMs (generous for dev)
    message: {
        status: 'error',
        message: 'Too many login attempts from this IP, please try again after a minute',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per windowMs (generous for dev)
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after a minute',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
