import { Router, type Router as ExpressRouter } from 'express';
import * as exercisesController from '../controllers/exercises.controller';
import { validateBody } from '../middleware/validate';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { bulkUpdateExerciseEditorialSchema, createExerciseSchema, updateExerciseSchema } from '../utils/validators';

const router: ExpressRouter = Router();

// Metadatos (categorías, grupos musculares, equipos)
router.get('/meta/categories', exercisesController.getCategories);
router.get('/meta/muscle-groups', exercisesController.getMuscleGroups);
router.get('/meta/equipment', exercisesController.getEquipment);
router.get('/meta/training-environments', exercisesController.getTrainingEnvironments);
router.get('/editorial/summary', authenticate, requireAdmin, exercisesController.getEditorialSummary);

// CRUD de ejercicios
router.get('/', optionalAuthenticate, exercisesController.getAllExercises);
router.get('/:id', optionalAuthenticate, exercisesController.getExerciseById);
router.post('/', authenticate, requireAdmin, validateBody(createExerciseSchema), exercisesController.createExercise);
router.put('/:id', authenticate, requireAdmin, validateBody(updateExerciseSchema), exercisesController.updateExercise);
router.post('/editorial/bulk-update', authenticate, requireAdmin, validateBody(bulkUpdateExerciseEditorialSchema), exercisesController.bulkUpdateExerciseEditorial);
router.delete('/:id', authenticate, requireAdmin, exercisesController.deleteExercise);

export default router;
