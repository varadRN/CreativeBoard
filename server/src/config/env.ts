import { z } from 'zod';
import dotenv from 'dotenv';
import { Logger } from '../utils/logger';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET must be at least 10 chars'),
    JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 chars'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    REDIS_URL: z.string().optional(),
});

const parseEnv = () => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        Logger.error('❌ Invalid environment variables:', result.error.format());
        process.exit(1);
    }

    return result.data;
};

export const env = parseEnv();
