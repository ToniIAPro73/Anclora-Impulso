import { Request, Response, NextFunction } from 'express';
import * as nutritionService from '../services/nutrition.service';
import type {
  BulkUpdateRecipeEditorialInput,
  CreateNutritionLogInput,
  GenerateMealPlanInput,
  UpdateRecipeInput,
} from '../utils/validators';

/**
 * POST /api/nutrition/meal-plans/generate
 */
export async function generateMealPlan(
  req: Request<{}, {}, GenerateMealPlanInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const mealPlan = await nutritionService.generateMealPlan(req.user.userId, req.body);
    res.status(201).json(mealPlan);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/nutrition/meal-plans
 */
export async function getUserMealPlans(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const plans = await nutritionService.getUserMealPlans(req.user.userId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/nutrition/meal-plans/:id
 */
export async function getMealPlanById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const plan = await nutritionService.getMealPlanById(req.params.id, req.user.userId);
    res.json(plan);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/nutrition/meal-plans/:id
 */
export async function deleteMealPlan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    await nutritionService.deleteMealPlan(req.params.id, req.user.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/nutrition/recipes/:id
 */
export async function getRecipeById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipe = await nutritionService.getRecipeById(req.params.id);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
}

export async function updateRecipe(
  req: Request<{ id: string }, {}, UpdateRecipeInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipe = await nutritionService.updateRecipe(req.params.id, req.body);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
}

export async function getRecipeEditorialSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = await nutritionService.getRecipeEditorialSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdateRecipeEditorial(
  req: Request<{}, {}, BulkUpdateRecipeEditorialInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipes = await nutritionService.bulkUpdateRecipeEditorial(req.body);
    res.json(recipes);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/nutrition/log
 */
export async function createNutritionLog(
  req: Request<{}, {}, CreateNutritionLogInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const log = await nutritionService.createNutritionLog(req.user.userId, req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/nutrition/logs
 */
export async function getNutritionLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const period = (req.query.period as 'day' | 'week') || 'day';
    const logs = await nutritionService.getNutritionLogs(req.user.userId, period);
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/nutrition/summary
 */
export async function getNutritionSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const period = (req.query.period as 'day' | 'week') || 'day';
    const summary = await nutritionService.getNutritionSummary(req.user.userId, period);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}
