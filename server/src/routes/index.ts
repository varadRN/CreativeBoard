import { Router } from 'express';
import authRoutes from './auth.routes';
import boardRoutes from './board.routes';
import shareRoutes from './share.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/', shareRoutes); // Mounted at root to handle /boards/:id/share/... and /share/join/:token
router.use('/boards', boardRoutes);
router.use('/notifications', notificationRoutes);

export default router;
