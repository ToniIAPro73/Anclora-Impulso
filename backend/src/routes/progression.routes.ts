import { Router, type Router as ExpressRouter } from 'express';
import * as progressionController from '../controllers/progression.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { generateNextSessionSchema } from '../utils/validators';

const router: ExpressRouter = Router();

router.use(authenticate);
router.post('/next-session', validateBody(generateNextSessionSchema), progressionController.generateNextSession);

export default router;
