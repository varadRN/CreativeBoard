import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { paginationSchema } from '../validators/board.validator'; // Reusing pagination schema
import { UnauthorizedError } from '../utils/errors';

export class NotificationController {
    static async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await NotificationService.getNotifications(req.user.userId, page, limit);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const result = await NotificationService.getUnreadCount(req.user.userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            await NotificationService.markAsRead(req.params.id, req.user.userId);
            res.status(200).json({ success: true, message: 'Marked as read' });
        } catch (error) {
            next(error);
        }
    }

    static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            await NotificationService.markAllAsRead(req.user.userId);
            res.status(200).json({ success: true, message: 'All marked as read' });
        } catch (error) {
            next(error);
        }
    }

    static async deleteNotification(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            await NotificationService.deleteNotification(req.params.id, req.user.userId);
            res.status(200).json({ success: true, message: 'Notification deleted' });
        } catch (error) {
            next(error);
        }
    }
}
