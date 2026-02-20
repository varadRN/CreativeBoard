import { z } from 'zod';

export const inviteSchema = z.object({
    email: z.string().email('Invalid email address'),
    permission: z.enum(['viewer', 'editor'], {
        errorMap: () => ({ message: 'Permission must be viewer or editor' }),
    }),
});

export const updatePermissionSchema = z.object({
    permission: z.enum(['viewer', 'editor'], {
        errorMap: () => ({ message: 'Permission must be viewer or editor' }),
    }),
});

export const createShareLinkSchema = z.object({
    permission: z.enum(['viewer', 'editor'], {
        errorMap: () => ({ message: 'Permission must be viewer or editor' }),
    }),
});

// Since disable doesn't require body, we might not need schema or keep it simple
export const disableShareLinkSchema = z.object({}); 
