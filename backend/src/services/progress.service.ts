import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { CreateMeasurementInput } from '../utils/validators';
import * as sessionsService from './sessions.service';
import { getPersonalizationSnapshot } from './personalization.service';

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
  const [workoutStats, insights] = await Promise.all([
    sessionsService.getProgressStats(userId),
    getPersonalizationSnapshot(userId),
  ]);

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

  const explanation = {
    headline: 'Qué hacer ahora',
    summary:
      insights.stagnationRisk === 'high'
        ? 'Tus señales piden un ajuste pequeño pero inmediato para no consolidar el bloqueo.'
        : insights.adherenceRate !== null && insights.adherenceRate < 0.7
          ? 'Antes de subir exigencia, conviene recuperar consistencia en la semana.'
          : 'Tu progreso actual permite mantener la dirección y afinar detalles, no rehacer todo.',
    reasons: [
      insights.weeklyTarget
        ? `Vas ${insights.workoutsLast7Days}/${insights.weeklyTarget} sesiones en los últimos 7 días.`
        : 'Aún no hay objetivo semanal definido para medir adherencia.',
      insights.nutritionConsistencyRate !== null
        ? `La constancia nutricional reciente está en ${Math.round(insights.nutritionConsistencyRate * 100)}%.`
        : 'Todavía faltan días de registro nutricional para una lectura más precisa.',
      insights.weightTrend.deltaKg !== null
        ? `La tendencia de peso reciente muestra ${insights.weightTrend.deltaKg > 0 ? '+' : ''}${insights.weightTrend.deltaKg} kg.`
        : 'Aún faltan mediciones recientes para estimar tendencia de peso.',
    ],
    signals: [
      { label: 'Adherencia', value: insights.adherenceRate !== null ? `${Math.round(insights.adherenceRate * 100)}%` : '—' },
      { label: 'Riesgo', value: insights.stagnationRisk },
      { label: 'Nutrición', value: insights.nutritionConsistencyRate !== null ? `${Math.round(insights.nutritionConsistencyRate * 100)}%` : '—' },
    ],
    nextBestAction:
      insights.stagnationRisk === 'high'
        ? { label: 'Revisar progreso', href: '/progress' }
        : insights.workoutsLast7Days === 0
          ? { label: 'Volver a entrenar', href: '/workouts/generate' }
          : { label: 'Mantener ritmo', href: '/dashboard' },
  };

  return {
    stats: workoutStats,
    measurements,
    charts: {
      weight: weightData,
      bodyFat: bodyFatData,
      frequency: frequencyData,
    },
    insights: {
      profileCompletion: insights.profileCompletion,
      missingProfileFields: insights.missingProfileFields,
      weeklyTarget: insights.weeklyTarget,
      workoutsLast7Days: insights.workoutsLast7Days,
      workoutsLast28Days: insights.workoutsLast28Days,
      adherenceRate: insights.adherenceRate,
      nutritionLogDaysLast7: insights.nutritionLogDaysLast7,
      nutritionConsistencyRate: insights.nutritionConsistencyRate,
      weightTrend: insights.weightTrend,
      stagnationRisk: insights.stagnationRisk,
      workoutAdjustment: insights.workoutAdjustment,
      nutritionAdjustment: insights.nutritionAdjustment,
      preferredMuscleGroups: insights.preferredMuscleGroups,
      averageSessionDuration: insights.averageSessionDuration,
      explanation,
    },
  };
}
