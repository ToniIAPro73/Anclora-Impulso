import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { CreateSessionInput } from '../utils/validators';

/**
 * Obtener todas las sesiones de un usuario
 */
export async function getUserSessions(userId: string, limit?: number) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    include: {
      workout: {
        select: {
          id: true,
          name: true,
        },
      },
      exercises: {
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              muscleGroup: true,
            },
          },
          sets: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
    ...(limit && { take: limit }),
  });

  return sessions;
}

/**
 * Obtener una sesión por ID
 */
export async function getSessionById(id: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id, userId },
    include: {
      workout: true,
      exercises: {
        include: {
          exercise: true,
          sets: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!session) {
    throw new AppError(404, 'Sesión no encontrada');
  }

  return session;
}

/**
 * Crear una nueva sesión de entrenamiento
 */
export async function createSession(userId: string, data: CreateSessionInput) {
  const session = await prisma.workoutSession.create({
    data: {
      userId,
      workoutId: data.workoutId,
      duration: data.duration,
      notes: data.notes,
      exercises: {
        create: data.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: {
            create: exercise.sets,
          },
        })),
      },
    },
    include: {
      workout: true,
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  return session;
}

/**
 * Actualizar una sesión
 */
export async function updateSession(id: string, userId: string, data: Partial<CreateSessionInput>) {
  const existingSession = await prisma.workoutSession.findFirst({
    where: { id, userId },
  });

  if (!existingSession) {
    throw new AppError(404, 'Sesión no encontrada');
  }

  const session = await prisma.workoutSession.update({
    where: { id },
    data: {
      duration: data.duration,
      notes: data.notes,
    },
    include: {
      workout: true,
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  return session;
}

/**
 * Eliminar una sesión
 */
export async function deleteSession(id: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id, userId },
  });

  if (!session) {
    throw new AppError(404, 'Sesión no encontrada');
  }

  await prisma.workoutSession.delete({
    where: { id },
  });
}

/**
 * Obtener estadísticas de progreso
 */
export async function getProgressStats(userId: string) {
  // Total de entrenamientos
  const totalWorkouts = await prisma.workoutSession.count({
    where: { userId },
  });

  // Entrenamientos esta semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const workoutsThisWeek = await prisma.workoutSession.count({
    where: {
      userId,
      completedAt: { gte: oneWeekAgo },
    },
  });

  // Entrenamientos este mes
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const workoutsThisMonth = await prisma.workoutSession.count({
    where: {
      userId,
      completedAt: { gte: oneMonthAgo },
    },
  });

  // Tiempo total de entrenamiento
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    select: { duration: true },
  });

  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

  // Récords personales (peso máximo por ejercicio)
  const personalRecords = await prisma.$queryRaw<Array<{
    exercise_id: string;
    exercise_name: string;
    max_weight: number;
    date: Date;
  }>>`
    SELECT 
      e.id as exercise_id,
      e.name as exercise_name,
      MAX(ss.weight) as max_weight,
      ws.completed_at as date
    FROM session_sets ss
    JOIN session_exercises se ON ss.session_exercise_id = se.id
    JOIN exercises e ON se.exercise_id = e.id
    JOIN workout_sessions ws ON se.session_id = ws.id
    WHERE ws.user_id = ${userId}
    GROUP BY e.id, e.name, ws.completed_at
    ORDER BY max_weight DESC
    LIMIT 10
  `;

  return {
    totalWorkouts,
    workoutsThisWeek,
    workoutsThisMonth,
    totalDuration,
    avgDuration: Math.round(avgDuration),
    personalRecords,
  };
}
