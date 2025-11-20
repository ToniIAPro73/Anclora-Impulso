import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { CreateWorkoutInput, GenerateWorkoutInput } from '../utils/validators';
import { env } from '../config/env';

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
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
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
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workout) {
    throw new AppError(404, 'Entrenamiento no encontrado');
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
export async function updateWorkout(id: string, userId: string, data: Partial<CreateWorkoutInput>) {
  // Verificar que el entrenamiento pertenece al usuario
  const existingWorkout = await prisma.workout.findFirst({
    where: { id, userId },
  });

  if (!existingWorkout) {
    throw new AppError(404, 'Entrenamiento no encontrado');
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
    throw new AppError(404, 'Entrenamiento no encontrado');
  }

  await prisma.workout.delete({
    where: { id },
  });
}

/**
 * Generar un entrenamiento con IA
 */
export async function generateWorkout(userId: string, params: GenerateWorkoutInput) {
  // Obtener ejercicios según los parámetros
  const where: any = {
    difficulty: params.difficulty,
  };

  if (params.targetMuscles && params.targetMuscles.length > 0) {
    where.muscleGroup = { in: params.targetMuscles };
  }

  if (params.equipment && params.equipment.length > 0) {
    where.equipment = { in: params.equipment };
  }

  const availableExercises = await prisma.exercise.findMany({
    where,
  });

  if (availableExercises.length === 0) {
    throw new AppError(400, 'No se encontraron ejercicios con los criterios especificados');
  }

  // Si hay API key de OpenAI, usar IA para generar el entrenamiento
  if (env.openaiApiKey) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: env.openaiApiKey });

      const prompt = `Genera un entrenamiento de fitness con las siguientes características:
- Tipo: ${params.workoutType}
- Duración: ${params.duration} minutos
- Dificultad: ${params.difficulty}
- Músculos objetivo: ${params.targetMuscles?.join(', ') || 'todos'}
- Equipo disponible: ${params.equipment?.join(', ') || 'cualquiera'}

Ejercicios disponibles:
${availableExercises.map((e, i) => `${i + 1}. ${e.name} (${e.muscleGroup}, ${e.equipment})`).join('\n')}

Responde SOLO con un JSON válido en este formato exacto (sin markdown ni explicaciones):
{
  "name": "Nombre del entrenamiento",
  "exercises": [
    {
      "exerciseId": "id del ejercicio de la lista",
      "sets": número de series,
      "reps": número de repeticiones,
      "rest": segundos de descanso,
      "order": orden (0, 1, 2...)
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content?.trim();
      if (!content) {
        throw new Error('Respuesta vacía de OpenAI');
      }

      const workoutData = JSON.parse(content);
      
      // Crear el entrenamiento
      return await createWorkout(userId, workoutData);
    } catch (error) {
      console.error('Error al generar con IA:', error);
      // Continuar con generación básica
    }
  }

  // Generación básica sin IA
  const selectedExercises = availableExercises
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(6, availableExercises.length));

  const workoutData: CreateWorkoutInput = {
    name: `Entrenamiento de ${params.workoutType} - ${params.difficulty}`,
    exercises: selectedExercises.map((exercise, index) => ({
      exerciseId: exercise.id,
      sets: params.difficulty === 'beginner' ? 3 : params.difficulty === 'intermediate' ? 4 : 5,
      reps: params.difficulty === 'beginner' ? 10 : params.difficulty === 'intermediate' ? 12 : 15,
      rest: 60,
      order: index,
    })),
  };

  return await createWorkout(userId, workoutData);
}
