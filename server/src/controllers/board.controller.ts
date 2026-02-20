import { Request, Response, NextFunction } from 'express';
import { BoardService } from '../services/board.service';
import {
    createBoardSchema,
    updateBoardSchema,
    starBoardSchema,
    searchSchema,
    paginationSchema,
    saveBoardCanvasSchema,
} from '../validators/board.validator';
import { UnauthorizedError } from '../utils/errors';

export class BoardController {
    static async getBoards(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await BoardService.getBoards(req.user.userId, page, limit);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getSharedBoards(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await BoardService.getSharedBoards(req.user.userId, page, limit);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getStarredBoards(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const result = await BoardService.getStarredBoards(req.user.userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getTrashBoards(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const result = await BoardService.getTrashBoards(req.user.userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async searchBoards(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { q } = searchSchema.parse(req.query);
            const result = await BoardService.searchBoards(req.user.userId, q);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async createBoard(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const data = createBoardSchema.parse(req.body);
            const board = await BoardService.createBoard(req.user.userId, data);
            res.status(201).json({ success: true, data: board });
        } catch (error) {
            next(error);
        }
    }

    static async getBoardById(req: Request, res: Response, next: NextFunction) {
        try {
            // userId is optional now
            const userId = req.user?.userId;
            const board = await BoardService.getBoardById(req.params.id, userId);
            res.status(200).json({ success: true, data: board });
        } catch (error) {
            next(error);
        }
    }

    static async updateBoard(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const data = updateBoardSchema.parse(req.body);
            const board = await BoardService.updateBoard(req.params.id, req.user.userId, data);
            res.status(200).json({ success: true, data: board });
        } catch (error) {
            next(error);
        }
    }

    static async deleteBoard(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            await BoardService.deleteBoard(req.params.id, req.user.userId);
            res.status(200).json({ success: true, message: 'Board moved to trash' });
        } catch (error) {
            next(error);
        }
    }

    static async duplicateBoard(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const board = await BoardService.duplicateBoard(req.params.id, req.user.userId);
            res.status(201).json({ success: true, data: board });
        } catch (error) {
            next(error);
        }
    }

    static async starBoard(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { isStarred } = starBoardSchema.parse(req.body);
            const board = await BoardService.starBoard(req.params.id, req.user.userId, isStarred);
            res.status(200).json({ success: true, data: board });
        } catch (error) {
            next(error);
        }
    }

    static async restoreBoard(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const board = await BoardService.restoreBoard(req.params.id, req.user.userId);
            res.status(200).json({ success: true, data: board });
        } catch (error) {
            next(error);
        }
    }

    static async permanentDeleteBoard(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            await BoardService.permanentDeleteBoard(req.params.id, req.user.userId);
            res.status(200).json({ success: true, message: 'Board permanently deleted' });
        } catch (error) {
            next(error);
        }
    }

    static async saveBoardCanvas(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(`[DEBUG] Received Canvas Save Request for Board: ${req.params.id}`); // DEBUG
            if (!req.user) throw new UnauthorizedError();

            // console.log(`[DEBUG] Padding Payload:`, JSON.stringify(req.body).substring(0, 100)); // OPTIONAL DEBUG

            const { canvasData, thumbnail } = saveBoardCanvasSchema.parse(req.body);
            console.log(`[DEBUG] Canvas Data Parsed. Size: ${JSON.stringify(canvasData).length} chars`); // DEBUG

            const board = await BoardService.saveBoardCanvas(req.params.id, req.user.userId, canvasData, thumbnail);
            console.log(`[DEBUG] BoardService save complete.`); // DEBUG

            res.status(200).json({ success: true, message: 'Canvas saved' });
        } catch (error) {
            console.error('[DEBUG] Save Failed:', error); // DEBUG
            next(error);
        }
    }
}
