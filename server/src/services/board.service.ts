import { prisma } from '../config/database';
import { CreateBoardInput, UpdateBoardInput } from '../validators/board.validator';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { Prisma } from '@prisma/client';


export class BoardService {
    static async getBoards(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [boards, total] = await Promise.all([
            prisma.board.findMany({
                where: {
                    createdById: userId,
                    isDeleted: false,
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    backgroundColor: true,
                    gridType: true,
                    createdById: true,
                    isStarred: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                    createdBy: {
                        select: { id: true, fullName: true, avatarUrl: true },
                    },
                },
            }),
            prisma.board.count({
                where: {
                    createdById: userId,
                    isDeleted: false,
                },
            }),
        ]);

        return { boards, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    static async getSharedBoards(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [permissions, total] = await Promise.all([
            prisma.boardPermission.findMany({
                where: { userId },
                skip,
                take: limit,
                include: {
                    board: {
                        select: {
                            id: true,
                            title: true,
                            backgroundColor: true,
                            gridType: true,
                            createdById: true,
                            isStarred: true,
                            isDeleted: true,
                            createdAt: true,
                            updatedAt: true,
                            createdBy: {
                                select: { id: true, fullName: true, avatarUrl: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.boardPermission.count({ where: { userId } }),
        ]);

        // Map permissions to return user-friendly board structure with permission info
        const boards = permissions.map(p => ({
            ...p.board,
            permission: p.permission,
        }));

        return { boards, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    static async getBoardById(boardId: string, userId?: string) {
        const board = await prisma.board.findUnique({
            where: { id: boardId },
            select: {
                id: true,
                title: true,
                backgroundColor: true,
                gridType: true,
                canvasData: true,
                createdById: true,
                publicAccess: true,
                isStarred: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                permissions: userId ? {
                    where: { userId },
                    select: { permission: true }
                } : undefined,
                createdBy: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
            },
        });

        if (!board) {
            throw new NotFoundError('Board not found');
        }

        if (board.isDeleted) {
            if (userId && board.createdById !== userId) {
                throw new NotFoundError('Board not found');
            }
            // Owner can see deleted board
            if (!userId) throw new NotFoundError('Board not found');
        }

        // Guest Access (Not logged in)
        if (!userId) {
            if (board.publicAccess === 'private') {
                throw new ForbiddenError('You do not have permission to access this board');
            }
            return {
                ...board,
                role: board.publicAccess === 'edit' ? 'editor' : 'viewer',
                isGuest: true,
            };
        }

        // Logged In User Access
        const isOwner = board.createdById === userId;
        const permission = board.permissions?.[0]?.permission;

        if (isOwner) {
            return { ...board, role: 'owner' };
        }

        if (permission) {
            return { ...board, role: permission };
        }

        // Not owner, no existing permission. Check Public Access.
        if (board.publicAccess !== 'private') {
            // AUTO-JOIN: Add user to board permissions so it shows in "Shared with me"
            try {
                const newRole = board.publicAccess === 'edit' ? 'editor' : 'viewer';
                await prisma.boardPermission.create({
                    data: {
                        boardId: board.id,
                        userId,
                        permission: newRole,
                        grantedById: board.createdById, // Auto-granted by owner's public setting
                    },
                });
                return { ...board, role: newRole };
            } catch (error) {
                // If race condition or already exists (should be caught by above check, but safety)
                return { ...board, role: board.publicAccess === 'edit' ? 'editor' : 'viewer' };
            }
        }

        throw new ForbiddenError('You do not have permission to access this board');
    }

    static async createBoard(userId: string, data: { title?: string }) {
        return prisma.board.create({
            data: {
                title: data.title || 'Untitled Board',
                createdById: userId,
            },
        });
    }

    static async updateBoard(boardId: string, userId: string, data: { title?: string; backgroundColor?: string; gridType?: string; publicAccess?: string }) {
        const board = await prisma.board.findUnique({ where: { id: boardId } });

        if (!board) throw new NotFoundError('Board not found');
        if (board.createdById !== userId) throw new ForbiddenError('Only the owner can update board settings');

        return prisma.board.update({
            where: { id: boardId },
            data,
        });
    }

    static async deleteBoard(boardId: string, userId: string) {
        const board = await prisma.board.findUnique({ where: { id: boardId } });

        if (!board) throw new NotFoundError('Board not found');
        if (board.createdById !== userId) throw new ForbiddenError('Only the owner can delete the board');

        return prisma.board.update({
            where: { id: boardId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }

    static async duplicateBoard(boardId: string, userId: string) {
        const board = await this.getBoardById(boardId, userId); // Permission check included

        return prisma.board.create({
            data: {
                title: `${board.title} (Copy)`,
                backgroundColor: board.backgroundColor,
                gridType: board.gridType,
                canvasData: board.canvasData || undefined,
                createdById: userId,
            },
        });
    }

    static async starBoard(boardId: string, userId: string, isStarred: boolean) {
        // Note: Schema has isStarred on Board, meaning it's global? 
        // Assuming schema intended per-user starring but put it on Board model.
        // If so, only owner acts on it.
        const board = await prisma.board.findUnique({ where: { id: boardId } });
        if (!board) throw new NotFoundError('Board not found');
        if (board.createdById !== userId) throw new ForbiddenError('Only owner can star this board (based on current schema)');

        return prisma.board.update({
            where: { id: boardId },
            data: { isStarred },
        });
    }

    static async searchBoards(userId: string, query: string) {
        // Search owned boards
        const ownedBoards = await prisma.board.findMany({
            where: {
                createdById: userId,
                isDeleted: false,
                title: { contains: query, mode: 'insensitive' },
            },
            select: {
                id: true,
                title: true,
                backgroundColor: true,
                gridType: true,
                createdById: true,
                isStarred: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
                createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });

        // Search shared boards
        const sharedPermissions = await prisma.boardPermission.findMany({
            where: {
                userId,
                board: {
                    title: { contains: query, mode: 'insensitive' },
                    isDeleted: false,
                },
            },
            include: {
                board: {
                    select: {
                        id: true,
                        title: true,
                        backgroundColor: true,
                        gridType: true,
                        createdById: true,
                        isStarred: true,
                        isDeleted: true,
                        createdAt: true,
                        updatedAt: true,
                        createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
                    },
                },
            },
        });

        const sharedBoards = sharedPermissions.map(p => ({
            ...p.board,
            permission: p.permission,
        }));

        return { owned: ownedBoards, shared: sharedBoards };
    }

    static async getStarredBoards(userId: string) {
        return prisma.board.findMany({
            where: {
                createdById: userId,
                isDeleted: false,
                isStarred: true,
            },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                backgroundColor: true,
                gridType: true,
                createdById: true,
                isStarred: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
                createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    static async getTrashBoards(userId: string) {
        return prisma.board.findMany({
            where: {
                createdById: userId,
                isDeleted: true,
            },
            orderBy: { deletedAt: 'desc' },
            select: {
                id: true,
                title: true,
                backgroundColor: true,
                gridType: true,
                createdById: true,
                isStarred: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });
    }

    static async restoreBoard(boardId: string, userId: string) {
        const board = await prisma.board.findUnique({ where: { id: boardId } });
        if (!board) throw new NotFoundError('Board not found');
        if (board.createdById !== userId) throw new ForbiddenError('Only owner can restore');

        return prisma.board.update({
            where: { id: boardId },
            data: { isDeleted: false, deletedAt: null },
        });
    }

    static async permanentDeleteBoard(boardId: string, userId: string) {
        const board = await prisma.board.findUnique({ where: { id: boardId } });
        if (!board) throw new NotFoundError('Board not found');
        if (board.createdById !== userId) throw new ForbiddenError('Only owner can delete permanently');

        return prisma.board.delete({
            where: { id: boardId },
        });
    }

    static async saveBoardCanvas(boardId: string, userId: string, canvasData: any, thumbnail?: string) {
        // Check access: owner or editor
        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: { permissions: { where: { userId } } },
        });

        if (!board) throw new NotFoundError('Board not found');

        const isOwner = board.createdById === userId;
        const isEditor = board.permissions.some(p => p.permission === 'editor');
        const isPublicEditor = board.publicAccess === 'editor';

        if (!isOwner && !isEditor && !isPublicEditor) {
            throw new ForbiddenError('You do not have permission to edit this board');
        }

        const updateData: any = { canvasData };
        if (thumbnail) {
            updateData.thumbnailUrl = thumbnail;
        }

        return prisma.board.update({
            where: { id: boardId },
            data: updateData,
        });
    }


}
