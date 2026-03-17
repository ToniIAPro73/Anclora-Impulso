import { Router } from 'express';
import * as productEventsController from '../controllers/product-events.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validateBody } from '../middleware/validate';
import { createProductEventSchema } from '../utils/validators';

const router: Router = Router();

router.use(authenticate);

router.post('/', validateBody(createProductEventSchema), productEventsController.createProductEvent);
router.get('/summary', requireAdmin, productEventsController.getProductEventsSummary);

export default router;
