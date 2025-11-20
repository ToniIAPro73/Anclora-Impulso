import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { CreateMeasurementInput } from '../utils/validators';
import * as sessionsService from './sessions.service';

/**
 * Obtener todas las medidas corporales de un usuario
 */
export async function getUserMeasurements(userId: string) {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  return measurements;
}

/**
 * Crear una nueva medida corporal
 */
export async function createMeasurement(userId: string, data: CreateMeasurementInput) {
  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId,
      ...data,
    },
  });

  return measurement;
}

/**
 * Actualizar una medida corporal
 */
export async function updateMeasurement(id: string, userId: string, data: Partial<CreateMeasurementInput>) {
  const existingMeasurement = await prisma.bodyMeasurement.findFirst({
    where: { id, userId },
  });

  if (!existingMeasurement) {
    throw new AppError(404, 'Medida no encontrada');
  }

  const measurement = await prisma.bodyMeasurement.update({
    where: { id },
    data,
  });

  return measurement;
}

/**
 * Eliminar una medida corporal
 */
export async function deleteMeasurement(id: string, userId: string) {
  const measurement = await prisma.bodyMeasurement.findFirst({
    where: { id, userId },
  });

  if (!measurement) {
    throw new AppError(404, 'Medida no encontrada');
  }

  await prisma.bodyMeasurement.delete({
    where: { id },
  });
}

/**
 * Obtener estadísticas completas de progreso
 */
export async function getCompleteProgress(userId: string) {
  // Estadísticas de entrenamientos
  const workoutStats = await sessionsService.getProgressStats(userId);

  // Medidas corporales
  const measurements = await getUserMeasurements(userId);

  // Datos para gráficos de peso y grasa corporal
  const weightData = measurements
    .filter((m) => m.weight !== null)
    .map((m) => ({
      date: m.date,
      weight: m.weight,
    }))
    .reverse();

  const bodyFatData = measurements
    .filter((m) => m.bodyFat !== null)
    .map((m) => ({
      date: m.date,
      bodyFat: m.bodyFat,
    }))
    .reverse();

  // Frecuencia de entrenamientos por semana (últimas 12 semanas)
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const recentSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      completedAt: { gte: twelveWeeksAgo },
    },
    select: {
      completedAt: true,
    },
    orderBy: { completedAt: 'asc' },
  });

  // Agrupar por semana
  const weeklyFrequency: Record<string, number> = {};
  recentSessions.forEach((session) => {
    const date = new Date(session.completedAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weeklyFrequency[weekKey] = (weeklyFrequency[weekKey] || 0) + 1;
  });

  const frequencyData = Object.entries(weeklyFrequency).map(([week, count]) => ({
    week,
    count,
  }));

  return {
    stats: workoutStats,
    measurements,
    charts: {
      weight: weightData,
      bodyFat: bodyFatData,
      frequency: frequencyData,
    },
  };
}
