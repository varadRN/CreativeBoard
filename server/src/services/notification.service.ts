import { prisma } from '../config/database';

export class NotificationService {
    static async createNotification(
        userId: string,
        type: string,
        title: string,
        message?: string,
        data?: any,
    ) {
        return prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data || undefined,
            },
        });
    }

    static async getNotifications(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where: { userId } }),
        ]);

        return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    static async markAsRead(notificationId: string, userId: string) {
        // Verify ownership implicitly by where clause
        // Use updateMany for safety if ID not found, or use findFirst + update
        return prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
    }

    static async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    static async getUnreadCount(userId: string) {
        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    static async deleteNotification(notificationId: string, userId: string) {
        return prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    }
}
