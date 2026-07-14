import { Router, type Router as ExpressRouter } from 'express';
import * as premiumController from '../controllers/premium.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createFormAnalysisSchema, createVoiceCuesSchema } from '../utils/validators';

const router: ExpressRouter = Router();

router.use(authenticate);
router.get('/status', premiumController.getStatus);
router.post('/form-analysis', validateBody(createFormAnalysisSchema), premiumController.createFormAnalysis);
router.post('/voice-cues', validateBody(createVoiceCuesSchema), premiumController.createVoiceCues);

export default router;
