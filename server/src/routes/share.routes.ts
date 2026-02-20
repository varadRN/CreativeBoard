import { Router } from 'express';
import { ShareController } from '../controllers/share.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Board-specific sharing routes
// Note: These will likely be mounted under /boards/:id/share? 
// Or better: The prompt requested /api/boards/:id/share/...
// So we should mount this entire router at /api with specific paths, 
// OR simpler: handle the :id param here and mount at /api

// However, the prompt specifies: POST /api/boards/:id/share/invite
// To avoiding conflicts with board routes, we should be careful.
// A clean way is to mount this on /api and define full paths,
// or use mergeParams: true if mounted under board routes.
// Given index.ts structure, let's mount at /api/share for general stuff, 
// and /api/boards/:id/share for board specific?
// Prompt says: POST /api/boards/:id/share/invite
// Let's implement these routes here and mount carefully or refactor.

// Let's use specific paths here and mount them appropriately in index.ts or 
// mount this router at /api/boards and use sub-paths.
// But we already have board.routes.ts at /api/boards.
// We can add these routes directly to board.routes.ts OR separate them.
// Separation is cleaner.
// Let's assume we mount this router at `/api` and define full paths for clarity given the request structure.
// Wait, prompt request 5: "Update server/src/routes/index.ts" to mount.
// Let's create `share.routes.ts` and handle the paths.

// Actually, `joinByShareLink` matches `/api/share/join/:token`.
// The others match `/api/boards/:id/share/...`.
// We can handle both groups here.

// Board sub-routes
router.post('/boards/:id/share/invite', ShareController.inviteByEmail);
router.get('/boards/:id/share/collaborators', ShareController.getCollaborators);
router.put('/boards/:id/share/collaborators/:userId', ShareController.updatePermission);
router.delete('/boards/:id/share/collaborators/:userId', ShareController.removeCollaborator);
router.post('/boards/:id/share/link', ShareController.createShareLink);
router.delete('/boards/:id/share/link/:linkId', ShareController.disableShareLink);

// General share routes
router.post('/share/join/:token', ShareController.joinByShareLink);

export default router;
