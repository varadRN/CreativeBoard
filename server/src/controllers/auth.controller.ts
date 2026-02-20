import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../validators/auth.validator';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data = registerSchema.parse(req.body);
            const user = await AuthService.register(data);
            res.status(201).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('[DEBUG] Login Request Body:', JSON.stringify(req.body, null, 2)); // DEBUG LOG
            const data = loginSchema.parse(req.body);
            const { user, accessToken, refreshToken } = await AuthService.login(data);

            res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
            res.status(200).json({ success: true, data: { user, accessToken } });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
            if (refreshToken) {
                await AuthService.logout(refreshToken);
            }
            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: 0 });
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
            if (!refreshToken) {
                throw new UnauthorizedError('No refresh token provided');
            }

            const { accessToken } = await AuthService.refreshAccessToken(refreshToken);
            res.status(200).json({ success: true, data: { accessToken } });
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = forgotPasswordSchema.parse(req.body);
            await AuthService.forgotPassword(email);
            res.status(200).json({ success: true, message: 'If an account exists, a password reset email has been sent.' });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const data = resetPasswordSchema.parse(req.body);
            await AuthService.resetPassword(data);
            res.status(200).json({ success: true, message: 'Password has been reset successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = verifyEmailSchema.parse(req.body);
            await AuthService.verifyEmail(token);
            res.status(200).json({ success: true, message: 'Email verified successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.userId) {
                throw new UnauthorizedError();
            }
            const user = await AuthService.getMe(req.user.userId);
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
}
