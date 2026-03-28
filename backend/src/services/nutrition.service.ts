import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateJSON, SYSTEM_PROMPT_ES } from './llm';
import { env } from '../config/env';
import logger from '../config/logger';
import { buildNutritionPersonalizationGuidance } from './forty-plus-guidance';
import {
  getPersonalizationSnapshot,
  type PersonalizationSnapshot,
} from './personalization.service';
import type { Prisma } from '@prisma/client';
import type {
  BulkUpdateRecipeEditorialInput,
  CreateRecipeInput,
  GenerateMealPlanInput,
  ListRecipesQueryInput,
  CreateNutritionLogInput,
  ReplaceMealRecipeInput,
  UpdateRecipeInput,
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

const recipeInclude = {
  ingredients: {
    include: {
      ingredient: true,
    },
  },
} satisfies Prisma.RecipeInclude;

function normalizeTagList(values: string[] | undefined): string[] {
  return Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));
}

function buildRecipeAccessWhere(userId: string, filters: ListRecipesQueryInput): Prisma.RecipeWhereInput {
  const accessWhere =
    filters.scope === 'mine'
      ? { userId }
      : filters.scope === 'public'
        ? { isPublic: true }
        : {
            OR: [
              { isPublic: true },
              { userId },
            ],
          };

  return {
    AND: [
      accessWhere,
      filters.query
        ? {
            OR: [
              { name: { contains: filters.query, mode: 'insensitive' } },
              { description: { contains: filters.query, mode: 'insensitive' } },
              { tags: { has: filters.query.toLowerCase() } },
            ],
          }
        : {},
      filters.mealType ? { mealTypes: { has: filters.mealType } } : {},
      filters.dietType ? { dietTypes: { has: filters.dietType } } : {},
      filters.goalType ? { goalTypes: { has: filters.goalType } } : {},
      filters.source ? { source: filters.source } : {},
    ],
  };
}

async function assertRecipeAccess(recipeId: string, userId: string) {
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      OR: [
        { isPublic: true },
        { userId },
      ],
    },
    include: recipeInclude,
  });

  if (!recipe) {
    throw new AppError(404, 'Receta no encontrada');
  }

  return recipe;
}

function calculateRecipeQuality(recipe: {
  description?: string | null;
  instructions: unknown;
  imageUrl?: string | null;
  difficulty?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  tags: string[];
  ingredients?: Array<unknown>;
  editorialOverrideStatus?: string | null;
  editorialNotes?: string | null;
}) {
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const checks = {
    hasDescription: Boolean(recipe.description && recipe.description.trim().length >= 24),
    hasEnoughInstructions: instructions.length >= 3,
    hasImage: Boolean(recipe.imageUrl),
    hasDifficulty: Boolean(recipe.difficulty),
    hasMacros: [recipe.calories, recipe.protein, recipe.carbs, recipe.fat].every((value) => typeof value === 'number' && value >= 0),
    hasTags: Array.isArray(recipe.tags) && recipe.tags.length >= 2,
    hasIngredients: Array.isArray(recipe.ingredients) && recipe.ingredients.length >= 3,
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  return {
    qualityScore: Math.round((passedChecks / Object.keys(checks).length) * 100),
    editorialStatus:
      recipe.editorialOverrideStatus ?? (passedChecks >= 6 ? 'ready' : passedChecks >= 4 ? 'review' : 'needs_work'),
    autoEditorialStatus: passedChecks >= 6 ? 'ready' : passedChecks >= 4 ? 'review' : 'needs_work',
    editorialNotes: recipe.editorialNotes ?? null,
    checks,
  };
}

function decorateRecipe<T extends {
  description?: string | null;
  instructions: unknown;
  imageUrl?: string | null;
  difficulty?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  tags: string[];
  ingredients?: Array<unknown>;
  editorialOverrideStatus?: string | null;
  editorialNotes?: string | null;
}>(recipe: T) {
  return {
    ...recipe,
    editorial: calculateRecipeQuality(recipe),
  };
}

function buildMealPlanExplanation(snapshot: PersonalizationSnapshot, plan: {
  dietType?: string | null;
  meals: Array<{ mealType: string; recipes: Array<{ recipe: { calories?: number | null; protein?: number | null } }> }>;
}) {
  const reasons: string[] = [];
  const nutritionConsistency = snapshot.nutritionConsistencyRate ?? 0;

  if (snapshot.profile.trainingGoal) {
    reasons.push(`El plan se orienta al objetivo ${snapshot.profile.trainingGoal}.`);
  }

  if (nutritionConsistency < 0.5) {
    reasons.push('La estructura prioriza continuidad y fricción baja porque tu registro reciente todavía es irregular.');
  } else if (nutritionConsistency > 0.85) {
    reasons.push('Tu buena constancia permite una pauta más afinada y controlada.');
  } else {
    reasons.push('La propuesta mantiene un nivel de precisión intermedio para no perder adherencia.');
  }

  if (plan.dietType === 'ayuno_intermitente') {
    reasons.push('Se respeta la ventana de ayuno intermitente y se reajustan excesos dentro de la semana.');
  }

  if (snapshot.stagnationRisk === 'high') {
    reasons.push('Hay riesgo de estancamiento, así que la pauta intenta hacer más visible el ajuste energético.');
  }

  return {
    headline: 'Por qué encaja contigo',
    summary:
      'La nutrición propuesta usa tu objetivo, tu ritmo de entrenamiento y tu constancia reciente para evitar un plan teórico difícil de sostener.',
    reasons,
    signals: [
      {
        label: 'Constancia nutricional',
        value: `${Math.round(nutritionConsistency * 100)}%`,
      },
      {
        label: 'Riesgo de estancamiento',
        value: snapshot.stagnationRisk,
      },
      {
        label: 'Objetivo semanal',
        value: snapshot.weeklyTarget ? `${snapshot.weeklyTarget} sesiones` : '—',
      },
    ],
    nextBestAction: {
      label: 'Registrar comida',
      href: '/nutrition',
    },
    adjustment:
      snapshot.nutritionAdjustment === 'reduce'
        ? 'Prioriza sencillez, saciedad y continuidad diaria.'
        : snapshot.nutritionAdjustment === 'increase'
          ? 'Tu base permite apretar algo más la precisión nutricional.'
          : 'Mantén la pauta y observa la tendencia semanal antes de corregir.',
  };
}

function decorateMealPlan<T extends { dietType?: string | null; meals: Array<{ mealType: string; recipes: Array<{ recipe: { calories?: number | null; protein?: number | null } }> }> }>(
  plan: T,
  snapshot: PersonalizationSnapshot
) {
  return {
    ...plan,
    explanation: buildMealPlanExplanation(snapshot, plan),
  };
}

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

    alta_proteina: `TIPO DE DIETA: Alta en proteína, orientada a saciedad, recuperación y mantenimiento/ganancia de masa muscular.
Principios obligatorios:
- Priorizar 25-40 g de proteína por comida principal
- Usar fuentes magras y variadas: pollo, pavo, huevos, yogur griego, legumbres, tofu, pescado y marisco
- Incluir verduras y carbohidratos complejos cuando aporten adherencia y rendimiento
- Evitar recetas con proteína insuficiente o macros vacíos
- Snacks opcionales ricos en proteína si encajan con el objetivo`,
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
            userId,
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
            tags: normalizeTagList([mealTypeMap[aiMeal.type] || aiMeal.type.toLowerCase(), params.dietType || 'ninguna', effectiveGoal || 'mantenimiento']),
            source: 'ai',
            isPublic: false,
            isEditable: true,
            mealTypes: [mealTypeMap[aiMeal.type] || aiMeal.type.toLowerCase()],
            dietTypes: params.dietType ? [params.dietType] : [],
            goalTypes: effectiveGoal ? [effectiveGoal] : [],
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
            selectedRecipeId: recipe.id,
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
  const [plans, snapshot] = await Promise.all([
    prisma.mealPlan.findMany({
      where: { userId },
      include: {
        meals: {
          include: {
            selectedRecipe: {
              include: recipeInclude,
            },
            recipes: {
              include: {
                recipe: {
                  include: recipeInclude,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    getPersonalizationSnapshot(userId),
  ]);

  return plans.map((plan) => decorateMealPlan(plan, snapshot));
}

/**
 * Obtener un plan de comida por ID
 */
export async function getMealPlanById(id: string, userId: string) {
  const [plan, snapshot] = await Promise.all([
    prisma.mealPlan.findFirst({
      where: { id, userId },
      include: {
        meals: {
          include: {
            selectedRecipe: {
              include: recipeInclude,
            },
            recipes: {
              include: {
                recipe: {
                  include: recipeInclude,
                },
              },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        },
      },
    }),
    getPersonalizationSnapshot(userId),
  ]);

  if (!plan) {
    throw new AppError(404, 'Plan de comidas no encontrado');
  }

  return decorateMealPlan(plan, snapshot);
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

export async function listRecipes(userId: string, filters: ListRecipesQueryInput) {
  const recipes = await prisma.recipe.findMany({
    where: buildRecipeAccessWhere(userId, filters),
    include: recipeInclude,
    orderBy: [
      { isPublic: 'desc' },
      { updatedAt: 'desc' },
    ],
    take: filters.limit ?? 50,
  });

  return recipes.map((recipe) => decorateRecipe(recipe));
}

export async function createRecipe(userId: string, data: CreateRecipeInput) {
  const recipe = await prisma.$transaction(async (tx) => {
    const createdRecipe = await tx.recipe.create({
      data: {
        userId,
        name: data.name,
        nameEn: data.nameEn ?? null,
        description: data.description ?? null,
        instructions: data.instructions,
        prepTime: data.prepTime ?? null,
        cookTime: data.cookTime ?? null,
        servings: data.servings ?? 1,
        difficulty: data.difficulty ?? null,
        calories: data.calories ?? null,
        protein: data.protein ?? null,
        carbs: data.carbs ?? null,
        fat: data.fat ?? null,
        fiber: data.fiber ?? null,
        imageUrl: data.imageUrl ?? null,
        tags: normalizeTagList(data.tags ?? []),
        source: 'user',
        isPublic: false,
        isEditable: true,
        mealTypes: data.mealTypes ?? [],
        dietTypes: data.dietTypes ?? [],
        goalTypes: normalizeTagList(data.goalTypes ?? []),
      },
    });

    for (const ingredientInput of data.ingredients) {
      const normalizedName = ingredientInput.name.trim().toLowerCase();
      const normalizedUnit = ingredientInput.unit.trim().toLowerCase();

      let ingredient = await tx.ingredient.findUnique({
        where: {
          name: normalizedName,
        },
      });

      if (!ingredient) {
        ingredient = await tx.ingredient.create({
          data: {
            name: normalizedName,
            unit: normalizedUnit,
          },
        });
      }

      await tx.recipeIngredient.create({
        data: {
          recipeId: createdRecipe.id,
          ingredientId: ingredient.id,
          quantity: ingredientInput.quantity,
        },
      });
    }

    return tx.recipe.findUniqueOrThrow({
      where: { id: createdRecipe.id },
      include: recipeInclude,
    });
  });

  return decorateRecipe(recipe);
}

export async function replaceMealRecipe(userId: string, mealId: string, data: ReplaceMealRecipeInput) {
  const nextRecipe = await assertRecipeAccess(data.recipeId, userId);

  const meal = await prisma.meal.findFirst({
    where: {
      id: mealId,
      mealPlan: {
        userId,
      },
    },
    include: {
      mealPlan: true,
      recipes: true,
    },
  });

  if (!meal) {
    throw new AppError(404, 'Comida no encontrada');
  }

  if (nextRecipe.mealTypes.length > 0 && !nextRecipe.mealTypes.includes(meal.mealType)) {
    throw new AppError(400, 'La receta seleccionada no es compatible con este tipo de comida');
  }

  const previousRecipeId = meal.selectedRecipeId ?? meal.recipes[0]?.recipeId ?? null;

  await prisma.$transaction(async (tx) => {
    await tx.mealRecipe.deleteMany({
      where: { mealId },
    });

    await tx.mealRecipe.create({
      data: {
        mealId,
        recipeId: nextRecipe.id,
      },
    });

    await tx.meal.update({
      where: { id: mealId },
      data: {
        selectedRecipeId: nextRecipe.id,
      },
    });

    await tx.mealSwapHistory.create({
      data: {
        mealId,
        previousRecipeId,
        newRecipeId: nextRecipe.id,
        swapSource: nextRecipe.source === 'ai' ? 'ai' : nextRecipe.source === 'system' ? 'system' : 'user',
        reason: data.reason ?? null,
      },
    });
  });

  return getMealPlanById(meal.mealPlanId, userId);
}

/**
 * Obtener detalle de una receta
 */
export async function getRecipeById(id: string, userId: string) {
  const recipe = await assertRecipeAccess(id, userId);
  return decorateRecipe(recipe);
}

export async function updateRecipe(id: string, data: UpdateRecipeInput) {
  const existingRecipe = await prisma.recipe.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingRecipe) {
    throw new AppError(404, 'Receta no encontrada');
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      name: data.name,
      nameEn: data.nameEn,
      description: data.description,
      instructions: data.instructions,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      difficulty: data.difficulty,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      imageUrl: data.imageUrl,
      tags: data.tags,
      editorialOverrideStatus: data.editorialOverrideStatus,
      editorialNotes: data.editorialNotes,
      editorialReviewedAt: data.editorialOverrideStatus || data.editorialNotes ? new Date() : undefined,
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  return decorateRecipe(recipe);
}

export async function bulkUpdateRecipeEditorial(data: BulkUpdateRecipeEditorialInput) {
  await prisma.recipe.updateMany({
    where: { id: { in: data.ids } },
    data: {
      editorialOverrideStatus: data.editorialOverrideStatus,
      editorialNotes: data.editorialNotes ?? null,
      editorialReviewedAt: new Date(),
    },
  });

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: data.ids } },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return recipes.map((recipe) => decorateRecipe(recipe));
}

export async function getRecipeEditorialSummary() {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const decorated = recipes.map((recipe) => decorateRecipe(recipe));

  return {
    total: decorated.length,
    averageQualityScore: decorated.length > 0
      ? Math.round(decorated.reduce((sum, recipe) => sum + recipe.editorial.qualityScore, 0) / decorated.length)
      : 0,
    byStatus: {
      ready: decorated.filter((recipe) => recipe.editorial.editorialStatus === 'ready').length,
      review: decorated.filter((recipe) => recipe.editorial.editorialStatus === 'review').length,
      needs_work: decorated.filter((recipe) => recipe.editorial.editorialStatus === 'needs_work').length,
    },
    recipes: decorated,
  };
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
