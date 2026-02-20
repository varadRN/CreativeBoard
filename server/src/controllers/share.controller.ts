import { Request, Response, NextFunction } from 'express';
import { ShareService } from '../services/share.service';
import {
    inviteSchema,
    updatePermissionSchema,
    createShareLinkSchema,
} from '../validators/share.validator';
import { UnauthorizedError } from '../utils/errors';

export class ShareController {
    static async inviteByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { email, permission } = inviteSchema.parse(req.body);
            await ShareService.inviteByEmail(req.params.id, req.user.userId, email, permission);
            res.status(200).json({ success: true, message: `Invited ${email}` });
        } catch (error) {
            next(error);
        }
    }

    static async removeCollaborator(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            await ShareService.removeCollaborator(req.params.id, req.user.userId, req.params.userId);
            res.status(200).json({ success: true, message: 'Collaborator removed' });
        } catch (error) {
            next(error);
        }
    }

    static async updatePermission(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { permission } = updatePermissionSchema.parse(req.body);
            await ShareService.updatePermission(req.params.id, req.user.userId, req.params.userId, permission);
            res.status(200).json({ success: true, message: 'Permission updated' });
        } catch (error) {
            next(error);
        }
    }

    static async getCollaborators(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const collaborators = await ShareService.getCollaborators(req.params.id, req.user.userId);
            res.status(200).json({ success: true, data: collaborators });
        } catch (error) {
            next(error);
        }
    }

    static async createShareLink(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const { permission } = createShareLinkSchema.parse(req.body);
            const link = await ShareService.createShareLink(req.params.id, req.user.userId, permission);
            res.status(201).json({ success: true, data: link });
        } catch (error) {
            next(error);
        }
    }

    static async disableShareLink(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            await ShareService.disableShareLink(req.params.id, req.user.userId, req.params.linkId);
            res.status(200).json({ success: true, message: 'Link disabled' });
        } catch (error) {
            next(error);
        }
    }

    static async joinByShareLink(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new UnauthorizedError();
            const result = await ShareService.joinByShareLink(req.params.token, req.user.userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
