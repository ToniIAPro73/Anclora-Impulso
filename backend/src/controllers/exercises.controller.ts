import { Request, Response, NextFunction } from 'express';
import * as exercisesService from '../services/exercises.service';
import type { CreateExerciseInput } from '../utils/validators';

/**
 * GET /api/exercises
 */
export async function getAllExercises(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = {
      category: req.query.category as string | undefined,
      muscleGroup: req.query.muscleGroup as string | undefined,
      equipment: req.query.equipment as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      search: req.query.search as string | undefined,
    };

    const exercises = await exercisesService.getAllExercises(filters);
    
    res.json(exercises);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/exercises/:id
 */
export async function getExerciseById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exercise = await exercisesService.getExerciseById(req.params.id);
    
    res.json(exercise);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/exercises
 */
export async function createExercise(
  req: Request<{}, {}, CreateExerciseInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exercise = await exercisesService.createExercise(req.body);
    
    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/exercises/:id
 */
export async function updateExercise(
  req: Request<{ id: string }, {}, Partial<CreateExerciseInput>>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exercise = await exercisesService.updateExercise(req.params.id, req.body);
    
    res.json(exercise);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/exercises/:id
 */
export async function deleteExercise(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await exercisesService.deleteExercise(req.params.id);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/exercises/meta/categories
 */
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await exercisesService.getCategories();
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/exercises/meta/muscle-groups
 */
export async function getMuscleGroups(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const muscleGroups = await exercisesService.getMuscleGroups();
    
    res.json(muscleGroups);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/exercises/meta/equipment
 */
export async function getEquipment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const equipment = await exercisesService.getEquipment();
    
    res.json(equipment);
  } catch (error) {
    next(error);
  }
}
