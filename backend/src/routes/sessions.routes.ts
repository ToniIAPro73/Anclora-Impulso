import { Router, type Router as ExpressRouter } from 'express';
import * as sessionsController from '../controllers/sessions.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createSessionSchema } from '../utils/validators';

const router: ExpressRouter = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// CRUD de sesiones
router.get('/', sessionsController.getUserSessions);
router.get('/:id', sessionsController.getSessionById);
router.post('/', validateBody(createSessionSchema), sessionsController.createSession);
router.put('/:id', sessionsController.updateSession);
router.delete('/:id', sessionsController.deleteSession);

export default router;
