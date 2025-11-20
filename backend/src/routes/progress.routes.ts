import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createMeasurementSchema } from '../utils/validators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Estadísticas y datos completos
router.get('/stats', progressController.getProgressStats);
router.get('/complete', progressController.getCompleteProgress);

// CRUD de medidas corporales
router.get('/measurements', progressController.getUserMeasurements);
router.post('/measurements', validateBody(createMeasurementSchema), progressController.createMeasurement);
router.put('/measurements/:id', progressController.updateMeasurement);
router.delete('/measurements/:id', progressController.deleteMeasurement);

export default router;
