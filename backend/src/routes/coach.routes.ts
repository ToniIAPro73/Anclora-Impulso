import { Router, type Router as ExpressRouter } from 'express';
import * as coachController from '../controllers/coach.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { sendCoachMessageSchema } from '../utils/validators';

const router: ExpressRouter = Router();

router.use(authenticate);
router.post('/messages', validateBody(sendCoachMessageSchema), coachController.sendMessage);

export default router;
