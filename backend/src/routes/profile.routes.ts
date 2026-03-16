import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema } from '../utils/validators';

const router: Router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', validateBody(updateProfileSchema), profileController.updateProfile);

export default router;
