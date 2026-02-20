import { prisma } from '../config/database';
import { registerSchema, loginSchema, resetPasswordSchema } from '../validators/auth.validator';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError, BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { z } from 'zod';
import crypto from 'crypto';
import { addDays } from 'date-fns';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export class AuthService {
    static async register(data: RegisterInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictError('Email already exists');
        }

        const hashedPassword = await hashPassword(data.password);
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const verifyTokenExpiry = addDays(new Date(), 1); // 24 hours

        // Generate random avatar color
        const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const user = await prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                passwordHash: hashedPassword,
                color: randomColor,
                verifyToken,
                verifyTokenExpiry,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                isActive: true,
                emailVerified: true,
                color: true,
            },
        });

        // TODO: Send verification email here using Nodemailer
        console.log(`[EMAIL] Verification link: http://localhost:5173/verify-email?token=${verifyToken}`);

        return user;
    }

    static async login(data: LoginInput) {
        console.log(`[AUTH] Login attempt for: ${data.email}`);
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            console.log(`[AUTH] User not found: ${data.email}`);
            throw new UnauthorizedError('Invalid email or password');
        }

        const isMatch = await comparePassword(data.password, user.passwordHash);

        console.log(`[AUTH] Password match for ${data.email}: ${isMatch}`);

        if (!isMatch) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Save refresh token to session
        await prisma.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: addDays(new Date(), 7),
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl || undefined,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt.toISOString(),
                color: user.color, // Return persisted color
            },
            accessToken,
            refreshToken,
        };
    }

    static async logout(refreshToken: string) {
        await prisma.session.delete({
            where: { refreshToken },
        }).catch(() => {
            // Ignore error if session doesn't exist
        });
    }

    static async refreshAccessToken(refreshToken: string) {
        try {
            const payload = verifyRefreshToken(refreshToken);

            const session = await prisma.session.findUnique({
                where: { refreshToken },
            });

            if (!session || session.expiresAt < new Date()) {
                throw new UnauthorizedError('Invalid session');
            }

            // Generate new access token
            const newAccessToken = generateAccessToken(payload.userId);
            return { accessToken: newAccessToken };
        } catch (error) {
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    static async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists, just return success
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = addDays(new Date(), 1); // 24 hours

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // TODO: Send email
        console.log(`[EMAIL] Reset link: http://localhost:5173/reset-password?token=${resetToken}`);
    }

    static async resetPassword(data: ResetPasswordInput) {
        // Find user by token (we need to potentially search, or if we structure token to include ID that's easier.
        // Since schema has resetToken as field, we search by it.
        // However, schema says resetToken is String? on User model.
        // Prisma `findFirst` can be used.
        const user = await prisma.user.findFirst({
            where: {
                resetToken: data.token,
                resetTokenExpiry: { gt: new Date() }
            },
        });

        if (!user) {
            throw new BadRequestError('Invalid or expired password reset token');
        }

        const hashedPassword = await hashPassword(data.newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
    }

    static async verifyEmail(token: string) {
        const user = await prisma.user.findFirst({
            where: {
                verifyToken: token,
                verifyTokenExpiry: { gt: new Date() }
            },
        });

        if (!user) {
            throw new BadRequestError('Invalid or expired verification token');
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyToken: null,
                verifyTokenExpiry: null,
            },
        });
    }

    static async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }
}
