import { z } from 'zod';

// Validadores de autenticación
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateProfileSchema = z.object({
  avatarDataUrl: z.string().max(2_000_000).nullable().optional(),
  sex: z.enum(['male', 'female']).nullable().optional(),
  age: z.number().int().min(14).max(100).nullable().optional(),
  heightCm: z.number().positive().max(300).nullable().optional(),
  weightKg: z.number().positive().max(400).nullable().optional(),
  targetWeightKg: z.number().positive().max(400).nullable().optional(),
  timeframeWeeks: z.number().int().min(1).max(260).nullable().optional(),
  trainingDaysPerWeek: z.number().int().min(1).max(7).nullable().optional(),
  trainingGoal: z.enum(['lose_weight', 'build_muscle', 'recomposition', 'maintain']).nullable().optional(),
  preferredTrainingEnvironment: z.enum(['gym', 'home', 'outdoor']).nullable().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).nullable().optional(),
  limitations: z.array(z.string().min(1).max(80)).max(8).optional(),
  onboardingCompletedAt: z.string().datetime().nullable().optional(),
  remindersEnabled: z.boolean().optional(),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  reminderWorkout: z.boolean().optional(),
  reminderNutrition: z.boolean().optional(),
  reminderWeeklyReview: z.boolean().optional(),
  reminderReactivation: z.boolean().optional(),
});

// Validadores de entrenamientos
export const createWorkoutSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid('ID de ejercicio inválido'),
      sets: z.number().int().min(1, 'Debe tener al menos 1 serie'),
      reps: z.number().int().min(1, 'Debe tener al menos 1 repetición'),
      rest: z.number().int().min(0, 'El descanso no puede ser negativo'),
      order: z.number().int().min(0, 'El orden no puede ser negativo'),
    })
  ),
});

// Validadores de sesiones
export const createSessionSchema = z.object({
  workoutId: z.string().uuid('ID de entrenamiento inválido'),
  duration: z.number().int().min(1, 'La duración debe ser al menos 1 segundo'),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid('ID de ejercicio inválido'),
      sets: z.array(
        z.object({
          reps: z.number().int().min(1, 'Debe tener al menos 1 repetición'),
          weight: z.number().min(0, 'El peso no puede ser negativo'),
          order: z.number().int().min(0, 'El orden no puede ser negativo'),
        })
      ),
    })
  ),
});

// Validadores de medidas corporales
export const createMeasurementSchema = z.object({
  date: z.string().datetime().optional(),
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  arms: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
});

// Validadores de ejercicios
export const createExerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.string().min(1, 'La categoría es requerida'),
  muscleGroup: z.string().min(1, 'El grupo muscular es requerido'),
  equipment: z.string().min(1, 'El equipo es requerido'),
  trainingEnvironments: z.array(z.enum(['gym', 'home', 'outdoor'])).default([]),
  difficulty: z.string().min(1, 'La dificultad es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  instructions: z.array(z.string()).min(1, 'Debe tener al menos una instrucción'),
});

export const updateExerciseSchema = createExerciseSchema.partial();
const editorialOverrideStatusSchema = z.enum(['ready', 'review', 'needs_work']).nullable().optional();
const editorialNotesSchema = z.string().max(4000).nullable().optional();

export const updateExerciseEditorialSchema = z.object({
  editorialOverrideStatus: editorialOverrideStatusSchema,
  editorialNotes: editorialNotesSchema,
});

export const bulkUpdateExerciseEditorialSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  editorialOverrideStatus: z.enum(['ready', 'review', 'needs_work']),
  editorialNotes: z.string().max(4000).nullable().optional(),
});

export const createProductEventSchema = z.object({
  action: z.string().min(1).max(80),
  category: z.string().min(1).max(40),
  source: z.string().min(1).max(40).optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateRecipeSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).nullable().optional(),
  description: z.string().min(1).nullable().optional(),
  instructions: z.array(z.string().min(1)).min(1).optional(),
  prepTime: z.number().int().min(0).nullable().optional(),
  cookTime: z.number().int().min(0).nullable().optional(),
  difficulty: z.string().min(1).nullable().optional(),
  calories: z.number().min(0).nullable().optional(),
  protein: z.number().min(0).nullable().optional(),
  carbs: z.number().min(0).nullable().optional(),
  fat: z.number().min(0).nullable().optional(),
  fiber: z.number().min(0).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string().min(1)).max(12).optional(),
  editorialOverrideStatus: editorialOverrideStatusSchema,
  editorialNotes: editorialNotesSchema,
});

export const createRecipeSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().min(1).nullable().optional(),
  description: z.string().min(1).nullable().optional(),
  instructions: z.array(z.string().min(1)).min(1),
  prepTime: z.number().int().min(0).nullable().optional(),
  cookTime: z.number().int().min(0).nullable().optional(),
  servings: z.number().int().min(1).max(20).optional(),
  difficulty: z.string().min(1).nullable().optional(),
  calories: z.number().min(0).nullable().optional(),
  protein: z.number().min(0).nullable().optional(),
  carbs: z.number().min(0).nullable().optional(),
  fat: z.number().min(0).nullable().optional(),
  fiber: z.number().min(0).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string().min(1)).max(12).default([]),
  mealTypes: z.array(z.enum(['desayuno', 'almuerzo', 'cena', 'snack'])).default([]),
  dietTypes: z.array(z.enum(['ninguna', 'mediterranea', 'dash', 'ayuno_intermitente', 'alta_proteina'])).default([]),
  goalTypes: z.array(z.string().min(1)).max(12).default([]),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
    })
  ).min(1),
});

export const bulkUpdateRecipeEditorialSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  editorialOverrideStatus: z.enum(['ready', 'review', 'needs_work']),
  editorialNotes: z.string().max(4000).nullable().optional(),
});

// Validador para generación de entrenamientos
export const generateWorkoutSchema = z.object({
  workoutType: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'full_body']),
  duration: z.number().int().min(10).max(180), // 10 a 180 minutos
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  trainingEnvironment: z.enum(['gym', 'home', 'outdoor']),
  targetMuscles: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  age: z.number().int().min(14).max(100).optional(),
  sex: z.enum(['male', 'female']).optional(),
});

// Validador para generación de planes de comida
export const generateMealPlanSchema = z.object({
  goal: z.string().optional(),
  difficulty: z.enum(['facil', 'medio', 'dificil']).optional(),
  dietType: z.enum(['ninguna', 'mediterranea', 'dash', 'ayuno_intermitente', 'alta_proteina']).optional(),
  maxIngredients: z.number().int().min(1).max(20).optional(),
  includeIngredients: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  age: z.number().int().min(14).max(100).optional(),
  sex: z.enum(['male', 'female']).optional(),
  weightKg: z.number().positive().max(400).optional(),
  targetWeightKg: z.number().positive().max(400).optional(),
  trainingDaysPerWeek: z.number().int().min(1).max(7).optional(),
});

// Validador para logs de nutrición
export const createNutritionLogSchema = z.object({
  date: z.string().optional(),
  consumedAt: z.string().optional(),
  mealType: z.enum(['desayuno', 'almuerzo', 'cena', 'snack']),
  recipeId: z.string().uuid().optional(),
  name: z.string().optional(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  notes: z.string().optional(),
});

export const listRecipesQuerySchema = z.object({
  query: z.string().min(1).optional(),
  mealType: z.enum(['desayuno', 'almuerzo', 'cena', 'snack']).optional(),
  dietType: z.enum(['ninguna', 'mediterranea', 'dash', 'ayuno_intermitente', 'alta_proteina']).optional(),
  goalType: z.string().min(1).optional(),
  source: z.enum(['system', 'ai', 'user']).optional(),
  scope: z.enum(['all', 'mine', 'public']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const replaceMealRecipeSchema = z.object({
  recipeId: z.string().uuid(),
  reason: z.string().max(500).nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type UpdateExerciseEditorialInput = z.infer<typeof updateExerciseEditorialSchema>;
export type BulkUpdateExerciseEditorialInput = z.infer<typeof bulkUpdateExerciseEditorialSchema>;
export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;
export type GenerateMealPlanInput = z.infer<typeof generateMealPlanSchema>;
export type CreateNutritionLogInput = z.infer<typeof createNutritionLogSchema>;
export type CreateProductEventInput = z.infer<typeof createProductEventSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type BulkUpdateRecipeEditorialInput = z.infer<typeof bulkUpdateRecipeEditorialSchema>;
export type ListRecipesQueryInput = z.infer<typeof listRecipesQuerySchema>;
export type ReplaceMealRecipeInput = z.infer<typeof replaceMealRecipeSchema>;
