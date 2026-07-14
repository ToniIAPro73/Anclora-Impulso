import { Router, type Router as ExpressRouter } from 'express';
import * as wearablesController from '../controllers/wearables.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createRecoverySampleSchema, upsertWearableConnectionSchema } from '../utils/validators';

const router: ExpressRouter = Router();

router.use(authenticate);
router.get('/status', wearablesController.getStatus);
router.put('/connections/:provider', validateBody(upsertWearableConnectionSchema), wearablesController.upsertConnection);
router.post('/recovery-samples', validateBody(createRecoverySampleSchema), wearablesController.createRecoverySample);
router.get('/readiness', wearablesController.getReadiness);

export default router;
