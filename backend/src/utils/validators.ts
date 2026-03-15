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

// Validador para generación de entrenamientos
export const generateWorkoutSchema = z.object({
  workoutType: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'full_body']),
  duration: z.number().int().min(10).max(180), // 10 a 180 minutos
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  trainingEnvironment: z.enum(['gym', 'home', 'outdoor']),
  targetMuscles: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
});

// Validador para generación de planes de comida
export const generateMealPlanSchema = z.object({
  goal: z.string().optional(),
  difficulty: z.enum(['facil', 'medio', 'dificil']).optional(),
  dietType: z.enum(['ninguna', 'mediterranea', 'dash', 'ayuno_intermitente']).optional(),
  maxIngredients: z.number().int().min(1).max(20).optional(),
  includeIngredients: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;
export type GenerateMealPlanInput = z.infer<typeof generateMealPlanSchema>;
export type CreateNutritionLogInput = z.infer<typeof createNutritionLogSchema>;
