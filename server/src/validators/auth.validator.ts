import { z } from 'zod';

export const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
        .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
        .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
        .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
        .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
        .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
        .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain at least one special character'),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Token is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().optional(),
});
