import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateJSON, SYSTEM_PROMPT_ES } from './llm';
import { env } from '../config/env';
import logger from '../config/logger';
import { buildNutritionPersonalizationGuidance } from './forty-plus-guidance';
import { getPersonalizationSnapshot } from './personalization.service';
import type { Prisma } from '@prisma/client';
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

type MealPlanWithMeals = Awaited<ReturnType<typeof getMealPlanById>>;
type PrismaTx = Prisma.TransactionClient;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const IF_FASTING_TARGET_HOURS = 16;
const IF_EATING_WINDOW_HOURS = 8;
const MAX_AUTOMATIC_REDUCTION_RATIO = 0.28;
const MIN_SERVING_MULTIPLIER = 0.72;

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  const jsDay = weekStart.getDay();
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  weekStart.setDate(weekStart.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function getDayOfWeekFromDate(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getWeekEnd(weekStart: Date): Date {
  return new Date(weekStart.getTime() + 7 * DAY_IN_MS);
}

async function ensureNutritionBalance(userId: string, tx: PrismaTx = prisma) {
  const existing = await tx.userNutritionBalance.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  return tx.userNutritionBalance.create({
    data: {
      userId,
      carryoverCalories: 0,
    },
  });
}

async function getPlanWithMeals(tx: PrismaTx, planId: string) {
  return tx.mealPlan.findUnique({
    where: { id: planId },
    include: {
      meals: {
        include: {
          recipes: {
            include: {
              recipe: true,
            },
          },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
      },
    },
  });
}

async function resetMealAdjustments(tx: PrismaTx, planId: string) {
  await tx.meal.updateMany({
    where: { mealPlanId: planId },
    data: {
      servingMultiplier: 1,
      adjustmentReason: null,
    },
  });
}

async function applyCalorieAdjustmentToPlan(
  tx: PrismaTx,
  planId: string,
  caloriesToCompensate: number,
  startDayOfWeek: number,
  reason: string
) {
  if (caloriesToCompensate <= 0) {
    return { absorbedCalories: 0, leftoverCalories: 0 };
  }

  const plan = await getPlanWithMeals(tx, planId);
  if (!plan) {
    return { absorbedCalories: 0, leftoverCalories: caloriesToCompensate };
  }

  const adjustableMeals = plan.meals.filter(
    (meal) =>
      meal.dayOfWeek >= startDayOfWeek &&
      meal.recipes.some((mealRecipe) => (mealRecipe.recipe.calories ?? 0) > 0)
  );

  if (adjustableMeals.length === 0) {
    return { absorbedCalories: 0, leftoverCalories: caloriesToCompensate };
  }

  const totalFutureCalories = adjustableMeals.reduce((sum, meal) => {
    const mealCalories = meal.recipes.reduce((mealSum, mealRecipe) => mealSum + (mealRecipe.recipe.calories ?? 0), 0);
    return sum + mealCalories;
  }, 0);

  if (totalFutureCalories <= 0) {
    return { absorbedCalories: 0, leftoverCalories: caloriesToCompensate };
  }

  const requestedRatio = caloriesToCompensate / totalFutureCalories;
  const appliedRatio = Math.min(requestedRatio, MAX_AUTOMATIC_REDUCTION_RATIO);

  for (const meal of adjustableMeals) {
    const updatedMultiplier = Math.max(MIN_SERVING_MULTIPLIER, 1 - appliedRatio);
    await tx.meal.update({
      where: { id: meal.id },
      data: {
        servingMultiplier: updatedMultiplier,
        adjustmentReason: reason,
      },
    });
  }

  const absorbedCalories = Math.round(totalFutureCalories * appliedRatio);
  return {
    absorbedCalories,
    leftoverCalories: Math.max(0, caloriesToCompensate - absorbedCalories),
  };
}

async function reapplyPlanAdjustments(
  tx: PrismaTx,
  planId: string,
  baseCarryoverCalories: number,
  currentWeekExcessCalories: number,
  currentDayOfWeek: number
) {
  await resetMealAdjustments(tx, planId);

  if (baseCarryoverCalories > 0) {
    await applyCalorieAdjustmentToPlan(
      tx,
      planId,
      baseCarryoverCalories,
      0,
      `Compensación arrastrada de la semana anterior (${Math.round(baseCarryoverCalories)} kcal)`
    );
  }

  if (currentWeekExcessCalories <= 0) {
    return 0;
  }

  const { leftoverCalories } = await applyCalorieAdjustmentToPlan(
    tx,
    planId,
    currentWeekExcessCalories,
    currentDayOfWeek + 1,
    `Ajuste por exceso acumulado de la semana (${Math.round(currentWeekExcessCalories)} kcal)`
  );

  return leftoverCalories;
}

async function reconcileIntermittentFastingBalance(
  tx: PrismaTx,
  userId: string,
  referenceDate: Date
) {
  const activeWeekStart = getWeekStart(referenceDate);
  const activeWeekEnd = getWeekEnd(activeWeekStart);
  const currentDayOfWeek = getDayOfWeekFromDate(referenceDate);

  const activePlan = await tx.mealPlan.findFirst({
    where: {
      userId,
      weekStart: {
        lte: referenceDate,
      },
      dietType: 'ayuno_intermitente',
    },
    orderBy: { weekStart: 'desc' },
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
  });

  if (!activePlan || activePlan.weekStart.getTime() < activeWeekStart.getTime()) {
    return;
  }

  const weekLogs = await tx.nutritionLog.findMany({
    where: {
      userId,
      date: {
        gte: activeWeekStart,
        lt: activeWeekEnd,
      },
    },
  });

  const plannedCaloriesByDay = new Map<number, number>();
  for (const meal of activePlan.meals) {
    const mealCalories = meal.recipes.reduce(
      (sum, mealRecipe) => sum + (mealRecipe.recipe.calories ?? 0) * (meal.servingMultiplier || 1),
      0
    );
    plannedCaloriesByDay.set(meal.dayOfWeek, (plannedCaloriesByDay.get(meal.dayOfWeek) ?? 0) + mealCalories);
  }

  const actualCaloriesByDay = new Map<number, number>();
  for (const log of weekLogs) {
    const logDay = getDayOfWeekFromDate(log.date);
    actualCaloriesByDay.set(logDay, (actualCaloriesByDay.get(logDay) ?? 0) + log.calories);
  }

  let cumulativeExcess = 0;
  for (let day = 0; day <= currentDayOfWeek; day += 1) {
    const planned = plannedCaloriesByDay.get(day) ?? 0;
    const actual = actualCaloriesByDay.get(day) ?? 0;
    if (actual > planned) {
      cumulativeExcess += actual - planned;
    }
  }

  let leftoverCalories = await reapplyPlanAdjustments(
    tx,
    activePlan.id,
    activePlan.carryoverCaloriesApplied,
    cumulativeExcess,
    currentDayOfWeek
  );

  const nextPlan = await tx.mealPlan.findFirst({
    where: {
      userId,
      dietType: 'ayuno_intermitente',
      weekStart: {
        gt: activePlan.weekStart,
      },
    },
    orderBy: { weekStart: 'asc' },
  });

  if (nextPlan && leftoverCalories > 0) {
    await resetMealAdjustments(tx, nextPlan.id);
    if (nextPlan.carryoverCaloriesApplied > 0) {
      await applyCalorieAdjustmentToPlan(
        tx,
        nextPlan.id,
        nextPlan.carryoverCaloriesApplied,
        0,
        `Compensación arrastrada de la semana anterior (${Math.round(nextPlan.carryoverCaloriesApplied)} kcal)`
      );
    }

    const nextAdjustment = await applyCalorieAdjustmentToPlan(
      tx,
      nextPlan.id,
      leftoverCalories,
      0,
      `Compensación por exceso pendiente de la semana previa (${Math.round(leftoverCalories)} kcal)`
    );
    leftoverCalories = nextAdjustment.leftoverCalories;
  }

  await tx.userNutritionBalance.upsert({
    where: { userId },
    update: { carryoverCalories: leftoverCalories },
    create: { userId, carryoverCalories: leftoverCalories },
  });
}

async function getIntermittentFastingState(userId: string, referenceDate: Date) {
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = getWeekEnd(weekStart);
  const activePlan = await prisma.mealPlan.findFirst({
    where: {
      userId,
      weekStart: {
        lte: referenceDate,
      },
    },
    orderBy: { weekStart: 'desc' },
  });

  const balance = await ensureNutritionBalance(userId);

  if (!activePlan || activePlan.weekStart.getTime() < weekStart.getTime() || activePlan.dietType !== 'ayuno_intermitente') {
    return {
      enabled: false,
      targetFastingHours: IF_FASTING_TARGET_HOURS,
      eatingWindowHours: null,
      fastingHours: null,
      firstIntakeAt: null,
      lastIntakeAt: null,
      snackCount: 0,
      exceededWindow: false,
      carryoverCalories: balance.carryoverCalories,
    };
  }

  const dayStart = new Date(referenceDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + DAY_IN_MS);

  const todayLogs = await prisma.nutritionLog.findMany({
    where: {
      userId,
      date: {
        gte: dayStart,
        lt: dayEnd,
      },
    },
    orderBy: { consumedAt: 'asc' },
  });

  const timestamps = todayLogs
    .map((log) => log.consumedAt ?? log.date)
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime());

  const first = timestamps[0] ?? null;
  const last = timestamps[timestamps.length - 1] ?? null;
  const eatingWindowHours = first && last ? Number(((last.getTime() - first.getTime()) / (1000 * 60 * 60)).toFixed(2)) : null;
  const fastingHours =
    eatingWindowHours !== null ? Number(Math.max(0, 24 - eatingWindowHours).toFixed(2)) : null;

  return {
    enabled: true,
    targetFastingHours: IF_FASTING_TARGET_HOURS,
    eatingWindowHours,
    fastingHours,
    firstIntakeAt: first ? first.toISOString() : null,
    lastIntakeAt: last ? last.toISOString() : null,
    snackCount: todayLogs.filter((log) => log.mealType === 'snack').length,
    exceededWindow: eatingWindowHours !== null ? eatingWindowHours > IF_EATING_WINDOW_HOURS : false,
    carryoverCalories: balance.carryoverCalories,
  };
}

/**
 * Generar un plan de comidas con IA
 */
export async function generateMealPlan(userId: string, params: GenerateMealPlanInput) {
  if (!env.groqApiKey) {
    throw new AppError(503, 'Servicio de IA no disponible. Configura GROQ_API_KEY.');
  }

  const snapshot = await getPersonalizationSnapshot(userId);
  const effectiveGoal =
    params.goal ??
    (snapshot.profile.trainingGoal === 'lose_weight'
      ? 'perdida_peso'
      : snapshot.profile.trainingGoal === 'build_muscle'
        ? 'ganancia_muscular'
        : snapshot.profile.trainingGoal === 'recomposition'
          ? 'recomposicion'
          : 'mantenimiento');
  const effectiveAge = params.age ?? snapshot.profile.age ?? undefined;
  const effectiveSex = params.sex ?? snapshot.profile.sex ?? undefined;
  const effectiveWeightKg = params.weightKg ?? snapshot.profile.weightKg ?? undefined;
  const effectiveTargetWeightKg = params.targetWeightKg ?? snapshot.profile.targetWeightKg ?? undefined;
  const effectiveTrainingDays =
    params.trainingDaysPerWeek ?? snapshot.profile.trainingDaysPerWeek ?? undefined;

  const ageAwareGuidance = buildNutritionPersonalizationGuidance({
    age: effectiveAge,
    sex: effectiveSex ?? null,
    weightKg: effectiveWeightKg,
    targetWeightKg: effectiveTargetWeightKg,
    trainingDaysPerWeek: effectiveTrainingDays,
  });

  const dietTypeInstructions: Record<string, string> = {
    mediterranea: `TIPO DE DIETA: Dieta Mediterránea (avalada por múltiples estudios clínicos, incluyendo el ensayo PREDIMED con +7.000 participantes).
Principios obligatorios:
- Base en aceite de oliva virgen extra como grasa principal
- Abundantes verduras, frutas, legumbres y cereales integrales en cada comida
- Pescado azul (salmón, sardinas, caballa) al menos 3 veces por semana
- Carnes rojas máximo 1 vez por semana; preferir aves y legumbres como proteína
- Frutos secos (nueces, almendras) como snack o ingrediente
- Lácteos fermentados (yogur griego, queso fresco) con moderación
- Uso de hierbas aromáticas (albahaca, romero, orégano) para condimentar`,

    dash: `TIPO DE DIETA: Dieta DASH (Dietary Approaches to Stop Hypertension), desarrollada por el NIH y avalada por la American Heart Association.
Principios obligatorios:
- Máximo 2.300 mg de sodio por día (objetivo ideal: 1.500 mg). Evitar sal añadida en recetas
- Alta en potasio, magnesio y calcio: incluir plátanos, espinacas, boniatos, leche desnatada, yogur
- Abundantes frutas y verduras (8-10 raciones diarias)
- Cereales integrales (avena, arroz integral, pan integral) en cada comida principal
- Proteínas magras: pollo sin piel, pavo, pescado, legumbres; limitar carnes rojas a 1-2 veces por semana
- Lácteos desnatados o semidesnatados 2-3 raciones diarias
- Evitar alimentos procesados, embutidos y quesos curados`,

    ayuno_intermitente: `TIPO DE DIETA: Ayuno Intermitente 16:8 (protocolo más estudiado científicamente, con evidencia en metabolismo, sensibilidad a insulina y pérdida de peso).
Principios obligatorios:
- Ventana de alimentación de 8 horas (ej. 12:00 - 20:00). SOLO 2 comidas principales: Almuerzo y Cena. NO incluir desayuno.
- Las 2 comidas deben ser nutricionalmente densas y saciantes para cubrir los requerimientos diarios
- Priorizar proteínas y grasas saludables para mantener la saciedad durante el ayuno
- Carbohidratos complejos y de bajo índice glucémico (avena, legumbres, verduras)
- Evitar azúcares simples y ultraprocesados que rompan el ritmo glucémico
- Para cada día: generar SOLO meals de tipo "Almuerzo" y "Cena" (no desayuno)`,
  };

  const constraints: string[] = [];
  if (params.dietType && params.dietType !== 'ninguna' && dietTypeInstructions[params.dietType]) {
    constraints.push(dietTypeInstructions[params.dietType]);
  }
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

  const isIF = params.dietType === 'ayuno_intermitente';
  const mealsPerDay = isIF
    ? 'EXACTAMENTE 2 comidas (Almuerzo y Cena, SIN desayuno)'
    : 'EXACTAMENTE 3 comidas (Desayuno, Almuerzo, Cena)';
  const mealTypes = isIF
    ? 'type: string (Almuerzo/Cena) — NO incluir Desayuno'
    : 'type: string (Desayuno/Almuerzo/Cena)';

  const prompt = `
Genera un plan de alimentación COMPLETO de 7 días (Lunes a Domingo) para un usuario con el siguiente perfil:
- Objetivo: ${effectiveGoal || 'mantenimiento saludable'}
- Edad: ${effectiveAge ?? 'no indicada'}
- Sexo: ${effectiveSex === 'female' ? 'mujer' : effectiveSex === 'male' ? 'hombre' : 'no indicado'}
- Peso actual: ${effectiveWeightKg ?? 'no indicado'} kg
- Peso objetivo: ${effectiveTargetWeightKg ?? 'no indicado'} kg
- Dias de entrenamiento por semana: ${effectiveTrainingDays ?? 'no indicados'}
- Adherencia nutricional últimos 7 días: ${Math.round((snapshot.nutritionConsistencyRate ?? 0) * 100)}%
- Adherencia de entrenamiento últimas 4 semanas: ${snapshot.adherenceRate !== null ? `${Math.round(snapshot.adherenceRate * 100)}%` : 'sin datos'}
- Riesgo de estancamiento: ${snapshot.stagnationRisk}
- Ajuste sugerido de nutrición: ${snapshot.nutritionAdjustment}
- Limitaciones reportadas: ${snapshot.profile.limitations.join(', ') || 'ninguna'}

Peticiones Específicas del Usuario:
${constraints.length > 0 ? constraints.join('\n') : '- Sin restricciones especiales'}
${ageAwareGuidance ? `\nAjustes obligatorios para este perfil:\n${ageAwareGuidance}` : ''}

Devuelve un objeto JSON con un array 'days' que contenga EXACTAMENTE 7 días:
Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo.

Cada día debe tener:
- day_name: string (Lunes, Martes, etc.)
- daily_macros: objeto con calories (int), protein (float), carbs (float), fats (float)
- meals: array con ${mealsPerDay}

Cada comida debe tener:
- ${mealTypes}
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

  const nutritionBalance = await ensureNutritionBalance(userId);
  const pendingCarryoverCalories = nutritionBalance.carryoverCalories ?? 0;

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
        goal: effectiveGoal || 'mantenimiento',
        dietType: params.dietType || 'ninguna',
        carryoverCaloriesApplied: pendingCarryoverCalories,
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
  }, { timeout: 60000 });

  if (pendingCarryoverCalories > 0) {
    await prisma.$transaction(async (tx) => {
      await applyCalorieAdjustmentToPlan(
        tx,
        mealPlan.id,
        pendingCarryoverCalories,
        0,
        `Compensación arrastrada de la semana anterior (${Math.round(pendingCarryoverCalories)} kcal)`
      );
      await tx.userNutritionBalance.update({
        where: { userId },
        data: { carryoverCalories: 0 },
      });
    });
  }

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

export async function deleteMealPlan(id: string, userId: string) {
  const existingPlan = await prisma.mealPlan.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existingPlan) {
    throw new AppError(404, 'Plan de comidas no encontrado');
  }

  await prisma.mealPlan.delete({
    where: { id },
  });
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
  const logDate = data.date ? new Date(data.date) : new Date();
  const consumedAt = data.consumedAt ? new Date(data.consumedAt) : logDate;

  return prisma.$transaction(async (tx) => {
    const createdLog = await tx.nutritionLog.create({
      data: {
        userId,
        date: logDate,
        consumedAt,
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

    await reconcileIntermittentFastingBalance(tx, userId, logDate);
    return createdLog;
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
  const fasting = await getIntermittentFastingState(userId, new Date());

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
    intermittentFasting: fasting,
  };
}
