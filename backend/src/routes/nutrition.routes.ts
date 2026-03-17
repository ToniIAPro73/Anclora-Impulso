import { Router } from 'express';
import * as nutritionController from '../controllers/nutrition.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { generateMealPlanSchema, createNutritionLogSchema, updateRecipeSchema } from '../utils/validators';
import { requireAdmin } from '../middleware/admin';

const router: Router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Planes de comida
router.post(
  '/meal-plans/generate',
  validateBody(generateMealPlanSchema),
  nutritionController.generateMealPlan
);
router.get('/meal-plans', nutritionController.getUserMealPlans);
router.get('/meal-plans/:id', nutritionController.getMealPlanById);
router.delete('/meal-plans/:id', nutritionController.deleteMealPlan);

// Recetas
router.get('/editorial/summary', requireAdmin, nutritionController.getRecipeEditorialSummary);
router.get('/recipes/:id', nutritionController.getRecipeById);
router.put('/recipes/:id', requireAdmin, validateBody(updateRecipeSchema), nutritionController.updateRecipe);

// Logs de nutrición
router.post('/log', validateBody(createNutritionLogSchema), nutritionController.createNutritionLog);
router.get('/logs', nutritionController.getNutritionLogs);
router.get('/summary', nutritionController.getNutritionSummary);

export default router;
