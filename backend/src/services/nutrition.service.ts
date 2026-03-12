import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateJSON, SYSTEM_PROMPT_ES } from './llm';
import { env } from '../config/env';
import logger from '../config/logger';
import type {
  GenerateMealPlanInput,
  CreateNutritionLogInput,
} from '../utils/validators';

interface AIRecipe {
  name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: { name: string; amount: string; unit: string }[];
  instructions: string[];
}

interface AIMeal {
  type: string;
  recipe: AIRecipe;
}

interface AIDay {
  day_name: string;
  daily_macros: { calories: number; protein: number; carbs: number; fats: number };
  meals: AIMeal[];
}

interface AIMealPlanResponse {
  days: AIDay[];
}

/**
 * Generar un plan de comidas con IA
 */
export async function generateMealPlan(userId: string, params: GenerateMealPlanInput) {
  if (!env.groqApiKey) {
    throw new AppError(503, 'Servicio de IA no disponible. Configura GROQ_API_KEY.');
  }

  const constraints: string[] = [];
  if (params.difficulty) {
    constraints.push(`- Dificultad de Receta: ${params.difficulty} (Adherirse estrictamente)`);
  }
  if (params.maxIngredients) {
    constraints.push(`- Máximo de ingredientes por receta: ${params.maxIngredients}`);
  }
  if (params.includeIngredients && params.includeIngredients.length > 0) {
    constraints.push(
      `- DEBE incluir estos ingredientes en algunas comidas: ${params.includeIngredients.join(', ')}`
    );
  }
  if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
    constraints.push(
      `- Restricciones dietéticas: ${params.dietaryRestrictions.join(', ')}`
    );
  }

  const prompt = `
Genera un plan de alimentación COMPLETO de 7 días (Lunes a Domingo) para un usuario con el siguiente perfil:
- Objetivo: ${params.goal || 'mantenimiento saludable'}

Peticiones Específicas del Usuario:
${constraints.length > 0 ? constraints.join('\n') : '- Sin restricciones especiales'}

Devuelve un objeto JSON con un array 'days' que contenga EXACTAMENTE 7 días:
Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo.

Cada día debe tener:
- day_name: string (Lunes, Martes, etc.)
- daily_macros: objeto con calories (int), protein (float), carbs (float), fats (float)
- meals: array con EXACTAMENTE 3 comidas (Desayuno, Almuerzo, Cena)

Cada comida debe tener:
- type: string (Desayuno/Almuerzo/Cena)
- recipe: objeto con:
    - name: string (EN ESPAÑOL)
    - description: string (EN ESPAÑOL)
    - prep_time: integer (minutos)
    - cook_time: integer (minutos)
    - difficulty: string (Fácil/Medio/Difícil)
    - calories: integer
    - protein: float
    - carbs: float
    - fats: float
    - ingredients: array de objetos con name (string), amount (string), unit (string)
    - instructions: array de strings (paso a paso detallado EN ESPAÑOL)

IMPORTANTE:
1. Todo el texto visible debe estar en ESPAÑOL.
2. Asegúrate de generar LOS 7 DÍAS completos.
3. Es CRÍTICO incluir ingredientes e instrucciones para CADA receta.
`;

  const aiResponse = await generateJSON<AIMealPlanResponse>({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_ES },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    maxTokens: 8000,
  });

  if (!aiResponse.days || aiResponse.days.length === 0) {
    throw new AppError(500, 'La IA no generó un plan de comidas válido');
  }

  // Calcular weekStart (próximo lunes)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + daysUntilMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Crear el meal plan en la base de datos con transacción
  const mealPlan = await prisma.$transaction(async (tx) => {
    const plan = await tx.mealPlan.create({
      data: {
        userId,
        weekStart,
        goal: params.goal || 'mantenimiento',
      },
    });

    for (let dayIndex = 0; dayIndex < aiResponse.days.length; dayIndex++) {
      const day = aiResponse.days[dayIndex];

      for (const aiMeal of day.meals) {
        const mealTypeMap: Record<string, string> = {
          Desayuno: 'desayuno',
          Almuerzo: 'almuerzo',
          Cena: 'cena',
          Snack: 'snack',
        };

        // Crear la receta
        const recipe = await tx.recipe.create({
          data: {
            name: aiMeal.recipe.name,
            description: aiMeal.recipe.description,
            instructions: aiMeal.recipe.instructions,
            prepTime: aiMeal.recipe.prep_time,
            cookTime: aiMeal.recipe.cook_time,
            difficulty: aiMeal.recipe.difficulty,
            calories: aiMeal.recipe.calories,
            protein: aiMeal.recipe.protein,
            carbs: aiMeal.recipe.carbs,
            fat: aiMeal.recipe.fats,
            servings: 1,
            tags: [mealTypeMap[aiMeal.type] || aiMeal.type.toLowerCase()],
          },
        });

        // Crear ingredientes y relaciones
        for (const ing of aiMeal.recipe.ingredients) {
          let ingredient = await tx.ingredient.findUnique({
            where: { name: ing.name.toLowerCase() },
          });

          if (!ingredient) {
            ingredient = await tx.ingredient.create({
              data: {
                name: ing.name.toLowerCase(),
                unit: ing.unit || 'unidad',
              },
            });
          }

          await tx.recipeIngredient.create({
            data: {
              recipeId: recipe.id,
              ingredientId: ingredient.id,
              quantity: parseFloat(ing.amount) || 1,
            },
          });
        }

        // Crear meal y conectar con receta
        const meal = await tx.meal.create({
          data: {
            mealPlanId: plan.id,
            dayOfWeek: dayIndex,
            mealType: mealTypeMap[aiMeal.type] || aiMeal.type.toLowerCase(),
          },
        });

        await tx.mealRecipe.create({
          data: {
            mealId: meal.id,
            recipeId: recipe.id,
          },
        });
      }
    }

    return plan;
  });

  logger.info('Meal plan generated', { userId, mealPlanId: mealPlan.id });

  // Retornar el plan completo
  return getMealPlanById(mealPlan.id, userId);
}

/**
 * Obtener todos los planes de comida de un usuario
 */
export async function getUserMealPlans(userId: string) {
  return prisma.mealPlan.findMany({
    where: { userId },
    include: {
      meals: {
        include: {
          recipes: {
            include: {
              recipe: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

/**
 * Obtener un plan de comida por ID
 */
export async function getMealPlanById(id: string, userId: string) {
  const plan = await prisma.mealPlan.findFirst({
    where: { id, userId },
    include: {
      meals: {
        include: {
          recipes: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
      },
    },
  });

  if (!plan) {
    throw new AppError(404, 'Plan de comidas no encontrado');
  }

  return plan;
}

/**
 * Obtener detalle de una receta
 */
export async function getRecipeById(id: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!recipe) {
    throw new AppError(404, 'Receta no encontrada');
  }

  return recipe;
}

/**
 * Registrar un log de nutrición
 */
export async function createNutritionLog(userId: string, data: CreateNutritionLogInput) {
  return prisma.nutritionLog.create({
    data: {
      userId,
      date: data.date ? new Date(data.date) : new Date(),
      mealType: data.mealType,
      recipeId: data.recipeId,
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      notes: data.notes,
    },
  });
}

/**
 * Obtener logs de nutrición de un usuario
 */
export async function getNutritionLogs(userId: string, period: 'day' | 'week' = 'day') {
  const now = new Date();
  let startDate: Date;

  if (period === 'day') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  }

  return prisma.nutritionLog.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    orderBy: { date: 'desc' },
  });
}

/**
 * Resumen de macros (diario o semanal)
 */
export async function getNutritionSummary(userId: string, period: 'day' | 'week' = 'day') {
  const logs = await getNutritionLogs(userId, period);

  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
      count: acc.count + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
  );

  const days = period === 'day' ? 1 : 7;

  return {
    period,
    totals,
    averages: {
      calories: Math.round(totals.calories / days),
      protein: Math.round(totals.protein / days),
      carbs: Math.round(totals.carbs / days),
      fat: Math.round(totals.fat / days),
    },
    logCount: totals.count,
  };
}
