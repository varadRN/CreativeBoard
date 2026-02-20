import { z } from 'zod';

export const createBoardSchema = z.object({
    title: z.string().max(255).optional(),
});

export const updateBoardSchema = z.object({
    title: z.string().max(255).optional(),
    backgroundColor: z.string().optional(),
    gridType: z.string().optional(),
    publicAccess: z.enum(['private', 'view', 'edit']).optional(),
});

export const starBoardSchema = z.object({
    isStarred: z.boolean(),
});

export const searchSchema = z.object({
    q: z.string().min(1),
});

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
});

export const saveBoardCanvasSchema = z.object({
    canvasData: z.any(),
    thumbnail: z.string().optional(),
});

// Export inferred types
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;