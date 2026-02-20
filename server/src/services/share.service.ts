import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/errors';
import { customAlphabet } from 'nanoid';
import { NotificationService } from './notification.service';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);

export class ShareService {
    static async verifyBoardOwner(boardId: string, userId: string) {
        const board = await prisma.board.findUnique({
            where: { id: boardId },
        });

        if (!board) throw new NotFoundError('Board not found');
        if (board.createdById !== userId) throw new ForbiddenError('Only the owner can manage sharing');

        return board;
    }

    static async inviteByEmail(boardId: string, ownerUserId: string, email: string, permission: string) {
        const board = await this.verifyBoardOwner(boardId, ownerUserId);

        // Fetch owner details for notification
        const owner = await prisma.user.findUnique({
            where: { id: ownerUserId },
            select: { fullName: true },
        });

        const targetUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!targetUser) {
            throw new NotFoundError('User with this email not found');
        }

        if (targetUser.id === ownerUserId) {
            throw new ConflictError('You are the owner of this board');
        }

        const existingPermission = await prisma.boardPermission.findUnique({
            where: {
                boardId_userId: {
                    boardId,
                    userId: targetUser.id,
                },
            },
        });

        if (existingPermission) {
            throw new ConflictError('User is already a collaborator');
        }

        const newPermission = await prisma.boardPermission.create({
            data: {
                boardId,
                userId: targetUser.id,
                permission,
                grantedById: ownerUserId,
            },
        });

        // Notify user
        await NotificationService.createNotification(
            targetUser.id,
            'board_invite',
            `You were invited to "${board.title}"`,
            `${owner?.fullName || 'Someone'} invited you as a ${permission}.`,
            { boardId, permission }
        );

        return newPermission;
    }

    static async removeCollaborator(boardId: string, ownerUserId: string, targetUserId: string) {
        await this.verifyBoardOwner(boardId, ownerUserId);

        if (ownerUserId === targetUserId) {
            throw new BadRequestError('Cannot remove the owner');
        }

        await prisma.boardPermission.delete({
            where: {
                boardId_userId: {
                    boardId,
                    userId: targetUserId,
                },
            },
        });
    }

    static async updatePermission(boardId: string, ownerUserId: string, targetUserId: string, permission: string) {
        await this.verifyBoardOwner(boardId, ownerUserId);

        if (ownerUserId === targetUserId) {
            return;
        }

        await prisma.boardPermission.update({
            where: {
                boardId_userId: {
                    boardId,
                    userId: targetUserId,
                },
            },
            data: { permission },
        });
    }

    static async getCollaborators(boardId: string, userId: string) {
        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                createdBy: {
                    select: { id: true, fullName: true, email: true, avatarUrl: true },
                },
                permissions: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true, avatarUrl: true },
                        },
                    },
                },
            },
        });

        if (!board) throw new NotFoundError('Board not found');

        const isOwner = board.createdById === userId;
        const hasPermission = board.permissions.some(p => p.userId === userId);

        if (!isOwner && !hasPermission) {
            throw new ForbiddenError('Access denied');
        }

        const collaborators = [
            {
                user: board.createdBy,
                role: 'owner',
                joinedAt: board.createdAt,
            },
            ...board.permissions.map(p => ({
                user: p.user,
                role: p.permission,
                joinedAt: p.createdAt,
            })),
        ];

        return collaborators;
    }

    static async createShareLink(boardId: string, ownerUserId: string, permission: string) {
        await this.verifyBoardOwner(boardId, ownerUserId);

        const shareToken = nanoid();

        return prisma.boardShareLink.create({
            data: {
                boardId,
                createdById: ownerUserId,
                permission,
                shareToken,
                isActive: true,
            },
        });
    }

    static async disableShareLink(boardId: string, ownerUserId: string, linkId: string) {
        await this.verifyBoardOwner(boardId, ownerUserId);

        return prisma.boardShareLink.updateMany({
            where: { id: linkId, boardId },
            data: { isActive: false },
        });
    }

    static async joinByShareLink(shareToken: string, userId: string) {
        const link = await prisma.boardShareLink.findUnique({
            where: { shareToken },
            include: { board: true },
        });

        if (!link || !link.isActive) {
            throw new BadRequestError('Invalid or expired invite link');
        }

        const board = link.board;
        if (!board || board.isDeleted) {
            throw new NotFoundError('Board not found or deleted');
        }

        if (board.createdById === userId) {
            return { boardId: board.id, message: 'You are the owner' };
        }

        const existing = await prisma.boardPermission.findUnique({
            where: {
                boardId_userId: { boardId: board.id, userId },
            },
        });

        if (existing) {
            return { boardId: board.id, message: 'Already a collaborator' };
        }

        await prisma.boardPermission.create({
            data: {
                boardId: board.id,
                userId,
                permission: link.permission,
                grantedById: link.createdById,
            },
        });

        return { boardId: board.id, message: 'Joined successfully' };
    }
}