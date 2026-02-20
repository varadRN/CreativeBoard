import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
    userId: string;
}

export const generateAccessToken = (userId: string): string => {
    const options: SignOptions = {
        expiresIn: 15 * 60, // 15 minutes in seconds
    };
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (userId: string): string => {
    const options: SignOptions = {
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};