import { Router } from 'express';
import * as gamificationController from '../controllers/gamification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/status', gamificationController.getStatus);
router.get('/achievements', gamificationController.getAchievements);
router.get('/xp-history', gamificationController.getXPHistory);

export default router;
