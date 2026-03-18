import { Router } from 'express';
import * as engagementController from '../controllers/engagement.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router: Router = Router();

router.use(authenticate);

router.get('/nudges', engagementController.getUserNudges);
router.get('/deliveries', engagementController.getUserNotificationHistory);
router.get('/admin/deliveries', requireAdmin, engagementController.getRecentNotificationDeliveries);
router.post('/admin/dispatch-now', requireAdmin, engagementController.dispatchNotificationsNow);

export default router;
