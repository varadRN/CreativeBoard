import { Router } from 'express';
import { BoardController } from '../controllers/board.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// Collection routes (Must be before /:id)
router.get('/', authenticate, BoardController.getBoards);
router.post('/', authenticate, BoardController.createBoard);
router.get('/shared', authenticate, BoardController.getSharedBoards);
router.get('/starred', authenticate, BoardController.getStarredBoards);
router.get('/trash', authenticate, BoardController.getTrashBoards);
router.get('/search', authenticate, BoardController.searchBoards);

// Item routes (Dynamic :id)
router.get('/:id', authenticate, BoardController.getBoardById); // Moved here
router.put('/:id', authenticate, BoardController.updateBoard);
router.delete('/:id', authenticate, BoardController.deleteBoard);
router.post('/:id/duplicate', authenticate, BoardController.duplicateBoard);
router.put('/:id/star', authenticate, BoardController.starBoard);
router.put('/:id/restore', authenticate, BoardController.restoreBoard);
router.delete('/:id/permanent', authenticate, BoardController.permanentDeleteBoard);
router.put('/:id/canvas', authenticate, BoardController.saveBoardCanvas);
router.post('/:id/canvas/beacon', authenticate, BoardController.saveBoardCanvas);

export default router;
