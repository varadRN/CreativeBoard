import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
