import { Router } from 'express';
import * as exercisesController from '../controllers/exercises.controller';
import { validateBody } from '../middleware/validate';
import { optionalAuthenticate } from '../middleware/auth';
import { createExerciseSchema } from '../utils/validators';

const router = Router();

// Metadatos (categorías, grupos musculares, equipos)
router.get('/meta/categories', exercisesController.getCategories);
router.get('/meta/muscle-groups', exercisesController.getMuscleGroups);
router.get('/meta/equipment', exercisesController.getEquipment);

// CRUD de ejercicios
router.get('/', optionalAuthenticate, exercisesController.getAllExercises);
router.get('/:id', optionalAuthenticate, exercisesController.getExerciseById);
router.post('/', validateBody(createExerciseSchema), exercisesController.createExercise);
router.put('/:id', exercisesController.updateExercise);
router.delete('/:id', exercisesController.deleteExercise);

export default router;
