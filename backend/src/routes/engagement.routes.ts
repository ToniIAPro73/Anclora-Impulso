import { Router } from 'express';
import * as engagementController from '../controllers/engagement.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/nudges', engagementController.getUserNudges);

export default router;
