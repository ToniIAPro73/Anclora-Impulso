import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import type {
  CreateWorkoutInput,
  GenerateWorkoutInput,
} from "../utils/validators";
import { env } from "../config/env";
import { buildWorkoutPersonalizationGuidance } from "./forty-plus-guidance";
import {
  getPersonalizationSnapshot,
  type PersonalizationSnapshot,
} from "./personalization.service";

function buildWorkoutExplanation(
  snapshot: PersonalizationSnapshot,
  workout: {
    exercises: Array<{
      exercise: {
        muscleGroup: string;
        trainingEnvironments?: string[];
      };
      rest: number;
    }>;
  }
) {
  const reasons: string[] = [];

  if (snapshot.profile.trainingGoal) {
    reasons.push(`Se ha priorizado el objetivo ${snapshot.profile.trainingGoal}.`);
  }

  if (snapshot.preferredMuscleGroups.length > 0) {
    reasons.push(
      `Se repiten grupos musculares donde ya hay más adherencia: ${snapshot.preferredMuscleGroups.join(", ")}.`
    );
  }

  if (snapshot.workoutAdjustment === "reduce") {
    reasons.push("Tu ritmo reciente pide bajar fricción: menos densidad, descansos más amables y ejecución más sostenible.");
  } else if (snapshot.workoutAdjustment === "increase") {
    reasons.push("Tu consistencia reciente permite subir un poco la exigencia sin romper adherencia.");
  } else {
    reasons.push("La carga se mantiene estable porque tu patrón reciente no pide una corrección brusca.");
  }

  if (snapshot.profile.preferredTrainingEnvironment) {
    reasons.push(`La propuesta respeta tu entorno preferido: ${snapshot.profile.preferredTrainingEnvironment}.`);
  }

  if (snapshot.stagnationRisk === "high") {
    reasons.push("Hay señales de estancamiento, así que la selección intenta reactivar progreso sin disparar fatiga.");
  }

  const targetMuscles = Array.from(
    new Set(workout.exercises.map((entry) => entry.exercise.muscleGroup))
  ).slice(0, 4);
  const averageRest =
    workout.exercises.length > 0
      ? Math.round(workout.exercises.reduce((sum, entry) => sum + entry.rest, 0) / workout.exercises.length)
      : null;

  return {
    headline: "Por qué encaja contigo",
    summary:
      snapshot.workoutsLast28Days > 0
        ? "La rutina combina tu objetivo, tu consistencia reciente y el tipo de esfuerzo que más probablemente mantendrá adherencia."
        : "La rutina parte de tu onboarding y crea una primera propuesta segura para empezar con claridad.",
    reasons,
    focusMuscles: targetMuscles,
    averageRest,
  };
}

function decorateWorkout<T extends { exercises: Array<{ exercise: { muscleGroup: string; trainingEnvironments?: string[] }; rest: number }> }>(
  workout: T,
  snapshot: PersonalizationSnapshot
) {
  return {
    ...workout,
    explanation: buildWorkoutExplanation(snapshot, workout),
  };
}

/**
 * Obtener todos los entrenamientos de un usuario
 */
export async function getUserWorkouts(userId: string) {
  const [workouts, snapshot] = await Promise.all([
    prisma.workout.findMany({
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
    }),
    getPersonalizationSnapshot(userId),
  ]);

  return workouts.map((workout) => decorateWorkout(workout, snapshot));
}

/**
 * Obtener un entrenamiento por ID
 */
export async function getWorkoutById(id: string, userId: string) {
  const [workout, snapshot] = await Promise.all([
    prisma.workout.findFirst({
      where: { id, userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: "asc" },
        },
      },
    }),
    getPersonalizationSnapshot(userId),
  ]);

  if (!workout) {
    throw new AppError(404, "Entrenamiento no encontrado");
  }

  return decorateWorkout(workout, snapshot);
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

  const snapshot = await getPersonalizationSnapshot(userId);
  return decorateWorkout(workout, snapshot);
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

  const snapshot = await getPersonalizationSnapshot(userId);
  return decorateWorkout(workout, snapshot);
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
