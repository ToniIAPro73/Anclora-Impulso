import { Router, type Router as ExpressRouter } from 'express';
import * as workoutsController from '../controllers/workouts.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createWorkoutSchema, generateWorkoutSchema } from '../utils/validators';

const router: ExpressRouter = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Generar entrenamiento con IA
router.post('/generate', validateBody(generateWorkoutSchema), workoutsController.generateWorkout);

// CRUD de entrenamientos
router.get('/', workoutsController.getUserWorkouts);
router.get('/:id', workoutsController.getWorkoutById);
router.post('/', validateBody(createWorkoutSchema), workoutsController.createWorkout);
router.put('/:id', workoutsController.updateWorkout);
router.delete('/:id', workoutsController.deleteWorkout);

export default router;
