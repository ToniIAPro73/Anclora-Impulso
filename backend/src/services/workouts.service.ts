import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import type {
  CreateWorkoutInput,
  GenerateWorkoutInput,
} from "../utils/validators";
import { env } from "../config/env";
import { buildWorkoutPersonalizationGuidance } from "./forty-plus-guidance";
import { getPersonalizationSnapshot } from "./personalization.service";

/**
 * Obtener todos los entrenamientos de un usuario
 */
export async function getUserWorkouts(userId: string) {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return workouts;
}

/**
 * Obtener un entrenamiento por ID
 */
export async function getWorkoutById(id: string, userId: string) {
  const workout = await prisma.workout.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!workout) {
    throw new AppError(404, "Entrenamiento no encontrado");
  }

  return workout;
}

/**
 * Crear un nuevo entrenamiento
 */
export async function createWorkout(userId: string, data: CreateWorkoutInput) {
  const workout = await prisma.workout.create({
    data: {
      userId,
      name: data.name,
      exercises: {
        create: data.exercises,
      },
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });

  return workout;
}

/**
 * Actualizar un entrenamiento
 */
export async function updateWorkout(
  id: string,
  userId: string,
  data: Partial<CreateWorkoutInput>,
) {
  // Verificar que el entrenamiento pertenece al usuario
  const existingWorkout = await prisma.workout.findFirst({
    where: { id, userId },
  });

  if (!existingWorkout) {
    throw new AppError(404, "Entrenamiento no encontrado");
  }

  // Si se actualizan los ejercicios, eliminar los existentes y crear los nuevos
  if (data.exercises) {
    await prisma.workoutExercise.deleteMany({
      where: { workoutId: id },
    });
  }

  const workout = await prisma.workout.update({
    where: { id },
    data: {
      name: data.name,
      ...(data.exercises && {
        exercises: {
          create: data.exercises,
        },
      }),
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });

  return workout;
}

/**
 * Eliminar un entrenamiento
 */
export async function deleteWorkout(id: string, userId: string) {
  const workout = await prisma.workout.findFirst({
    where: { id, userId },
  });

  if (!workout) {
    throw new AppError(404, "Entrenamiento no encontrado");
  }

  await prisma.workout.delete({
    where: { id },
  });
}

/**
 * Generar un entrenamiento con IA
 */
export async function generateWorkout(
  userId: string,
  params: GenerateWorkoutInput,
) {
  const snapshot = await getPersonalizationSnapshot(userId);
  const effectiveAge = params.age ?? snapshot.profile.age ?? undefined;
  const effectiveSex = params.sex ?? snapshot.profile.sex ?? undefined;
  const effectiveEnvironment =
    params.trainingEnvironment ?? snapshot.profile.preferredTrainingEnvironment ?? 'gym';
  const effectiveTargetMuscles =
    params.targetMuscles && params.targetMuscles.length > 0
      ? params.targetMuscles
      : snapshot.preferredMuscleGroups.length > 0
        ? snapshot.preferredMuscleGroups
        : undefined;

  const difficultyFromProfile = snapshot.profile.experienceLevel ?? params.difficulty;
  const effectiveDifficulty =
    snapshot.workoutAdjustment === 'reduce' && difficultyFromProfile === 'advanced'
      ? 'intermediate'
      : snapshot.workoutAdjustment === 'reduce' && difficultyFromProfile === 'intermediate'
        ? 'beginner'
        : difficultyFromProfile;

  const baseDuration = params.duration;
  const durationFromHistory =
    snapshot.averageSessionDuration && snapshot.averageSessionDuration > 0
      ? Math.round(snapshot.averageSessionDuration / 60 / 5) * 5
      : baseDuration;
  const effectiveDuration =
    snapshot.workoutAdjustment === 'reduce'
      ? Math.max(25, Math.min(baseDuration, durationFromHistory || baseDuration, 40))
      : snapshot.workoutAdjustment === 'increase'
        ? Math.min(75, Math.max(baseDuration, durationFromHistory || baseDuration))
        : Math.min(baseDuration, durationFromHistory || baseDuration);

  const ageAwareGuidance = buildWorkoutPersonalizationGuidance(
    effectiveAge,
    effectiveSex ?? null,
  );

  // Obtener ejercicios según los parámetros
  const where: any = {
    difficulty: effectiveDifficulty,
    trainingEnvironments: { has: effectiveEnvironment },
  };

  if (effectiveTargetMuscles && effectiveTargetMuscles.length > 0) {
    where.muscleGroup = { in: effectiveTargetMuscles };
  }

  if (params.equipment && params.equipment.length > 0) {
    where.equipment = { in: params.equipment };
  }

  const availableExercises = await prisma.exercise.findMany({
    where,
  });

  if (availableExercises.length === 0) {
    throw new AppError(
      400,
      "No se encontraron ejercicios con los criterios especificados",
    );
  }

  // Intentar generar con IA (Groq/Llama)
  if (env.groqApiKey) {
    try {
      const { generateJSON, SYSTEM_PROMPT_ES } = await import("./llm");

      const prompt = `Genera un entrenamiento de fitness con las siguientes características:
- Tipo: ${params.workoutType}
- Duración: ${effectiveDuration} minutos
- Dificultad: ${effectiveDifficulty}
- Entorno: ${effectiveEnvironment}
- Músculos objetivo: ${effectiveTargetMuscles?.join(", ") || "todos"}
- Equipo disponible: ${params.equipment?.join(", ") || "cualquiera"}
- Edad del usuario: ${effectiveAge ?? "no indicada"}
- Sexo del usuario: ${effectiveSex === "female" ? "mujer" : effectiveSex === "male" ? "hombre" : "no indicado"}
- Objetivo principal: ${snapshot.profile.trainingGoal ?? "no indicado"}
- Nivel declarado: ${snapshot.profile.experienceLevel ?? "no indicado"}
- Adherencia últimas 4 semanas: ${snapshot.adherenceRate !== null ? `${Math.round(snapshot.adherenceRate * 100)}%` : "sin datos"}
- Entrenamientos últimos 7 días: ${snapshot.workoutsLast7Days}
- Duración media reciente: ${snapshot.averageSessionDuration ? `${Math.round(snapshot.averageSessionDuration / 60)} min` : "sin datos"}
- Grupos musculares más trabajados: ${snapshot.preferredMuscleGroups.join(", ") || "sin datos"}
- Riesgo de estancamiento: ${snapshot.stagnationRisk}
- Limitaciones o molestias reportadas: ${snapshot.profile.limitations.join(", ") || "ninguna"}

${ageAwareGuidance ? `Reglas de personalizacion para este perfil:\n${ageAwareGuidance}\n` : ""}

Ejercicios disponibles:
${availableExercises.map((e, i) => `${i + 1}. ${e.name} (ID: ${e.id}, ${e.muscleGroup}, ${e.equipment})`).join("\n")}

Devuelve un JSON con este formato exacto:
{
  "name": "Nombre del entrenamiento en español",
  "exercises": [
    {
      "exerciseId": "id del ejercicio de la lista",
      "sets": número de series,
      "reps": número de repeticiones,
      "rest": segundos de descanso,
      "order": orden (0, 1, 2...)
    }
  ]
}

IMPORTANTE: Usa SOLO los IDs de ejercicios de la lista proporcionada.`;

      const workoutData = await generateJSON<CreateWorkoutInput>({
        messages: [
          { role: "system", content: SYSTEM_PROMPT_ES },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        maxTokens: 4000,
      });

      return await createWorkout(userId, workoutData);
    } catch (error) {
      console.error("Error al generar con IA:", error);
      // Continuar con generación básica
    }
  }

  // Generación básica sin IA
  const selectedExercises = availableExercises
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(effectiveAge && effectiveAge >= 40 ? 5 : 6, availableExercises.length));

  const workoutData: CreateWorkoutInput = {
    name: `Entrenamiento de ${params.workoutType} - ${effectiveDifficulty}`,
    exercises: selectedExercises.map((exercise, index) => ({
      exerciseId: exercise.id,
      sets:
        effectiveDifficulty === "beginner"
          ? 3
          : effectiveDifficulty === "intermediate"
            ? 4
            : 5,
      reps:
        effectiveDifficulty === "beginner"
          ? 10
          : effectiveDifficulty === "intermediate"
            ? 12
            : 15,
      rest: effectiveAge && effectiveAge >= 40 ? 75 : snapshot.workoutAdjustment === "reduce" ? 75 : 60,
      order: index,
    })),
  };

  return await createWorkout(userId, workoutData);
}
