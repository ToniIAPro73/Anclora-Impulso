import { prisma } from '../config/database';

type TrendDirection = 'up' | 'down' | 'stable' | 'insufficient_data';
type RiskLevel = 'low' | 'medium' | 'high';
type AdjustmentLevel = 'reduce' | 'maintain' | 'increase';

export interface PersonalizationSnapshot {
  profile: {
    sex: 'male' | 'female' | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
    targetWeightKg: number | null;
    timeframeWeeks: number | null;
    trainingDaysPerWeek: number | null;
    trainingGoal: 'lose_weight' | 'build_muscle' | 'recomposition' | 'maintain' | null;
    preferredTrainingEnvironment: 'gym' | 'home' | 'outdoor' | null;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null;
    limitations: string[];
    onboardingCompletedAt: Date | null;
  };
  profileCompletion: number;
  missingProfileFields: string[];
  workoutsLast7Days: number;
  workoutsLast28Days: number;
  weeklyTarget: number | null;
  adherenceRate: number | null;
  averageSessionDuration: number | null;
  preferredMuscleGroups: string[];
  nutritionLogDaysLast7: number;
  nutritionConsistencyRate: number | null;
  weightTrend: {
    direction: TrendDirection;
    deltaKg: number | null;
  };
  stagnationRisk: RiskLevel;
  workoutAdjustment: AdjustmentLevel;
  nutritionAdjustment: AdjustmentLevel;
}

const PROFILE_REQUIRED_FIELDS = [
  'sex',
  'age',
  'heightCm',
  'weightKg',
  'targetWeightKg',
  'timeframeWeeks',
  'trainingDaysPerWeek',
  'trainingGoal',
  'preferredTrainingEnvironment',
  'experienceLevel',
] as const;

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

export function computeProfileCompletion(profile: Record<string, unknown>) {
  const missingProfileFields = PROFILE_REQUIRED_FIELDS.filter((field) => {
    const value = profile[field];
    return value === null || value === undefined || value === '';
  });

  const completion = Math.round(
    ((PROFILE_REQUIRED_FIELDS.length - missingProfileFields.length) / PROFILE_REQUIRED_FIELDS.length) * 100,
  );

  return {
    completion,
    missingProfileFields,
  };
}

export async function getPersonalizationSnapshot(userId: string): Promise<PersonalizationSnapshot> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const twentyEightDaysAgo = new Date(now);
  twentyEightDaysAgo.setDate(now.getDate() - 28);
  const twentyOneDaysAgo = new Date(now);
  twentyOneDaysAgo.setDate(now.getDate() - 21);

  const [user, recentSessions, recentMeasurements, recentNutritionLogs] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        sex: true,
        age: true,
        heightCm: true,
        weightKg: true,
        targetWeightKg: true,
        timeframeWeeks: true,
        trainingDaysPerWeek: true,
        trainingGoal: true,
        preferredTrainingEnvironment: true,
        experienceLevel: true,
        limitations: true,
        onboardingCompletedAt: true,
      },
    }),
    prisma.workoutSession.findMany({
      where: {
        userId,
        completedAt: { gte: twentyEightDaysAgo },
      },
      orderBy: { completedAt: 'desc' },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                muscleGroup: true,
              },
            },
          },
        },
      },
    }),
    prisma.bodyMeasurement.findMany({
      where: {
        userId,
        date: { gte: twentyOneDaysAgo },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        weight: true,
      },
    }),
    prisma.nutritionLog.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'desc' },
      select: {
        date: true,
      },
    }),
  ]);

  const workoutsLast7Days = recentSessions.filter((session) => session.completedAt >= sevenDaysAgo).length;
  const workoutsLast28Days = recentSessions.length;
  const weeklyTarget = user.trainingDaysPerWeek ?? null;
  const adherenceRate =
    weeklyTarget && weeklyTarget > 0 ? Math.min(1.2, workoutsLast28Days / (weeklyTarget * 4)) : null;

  const averageSessionDuration =
    recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, session) => sum + session.duration, 0) / recentSessions.length)
      : null;

  const muscleGroupCounts = new Map<string, number>();
  for (const session of recentSessions.slice(0, 10)) {
    for (const exercise of session.exercises) {
      const muscleGroup = exercise.exercise.muscleGroup;
      muscleGroupCounts.set(muscleGroup, (muscleGroupCounts.get(muscleGroup) ?? 0) + 1);
    }
  }
  const preferredMuscleGroups = Array.from(muscleGroupCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([muscleGroup]) => muscleGroup);

  const nutritionLogDaysLast7 = new Set(
    recentNutritionLogs.map((log) => log.date.toISOString().slice(0, 10)),
  ).size;
  const nutritionConsistencyRate = round(nutritionLogDaysLast7 / 7);

  const weightedMeasurements = recentMeasurements.filter((measurement) => measurement.weight !== null);
  const firstMeasurement = weightedMeasurements[0];
  const lastMeasurement = weightedMeasurements[weightedMeasurements.length - 1];
  const weightTrend =
    firstMeasurement && lastMeasurement
      ? round((lastMeasurement.weight ?? 0) - (firstMeasurement.weight ?? 0), 2)
      : null;

  let direction: TrendDirection = 'insufficient_data';
  if (weightTrend !== null) {
    if (weightTrend <= -0.35) {
      direction = 'down';
    } else if (weightTrend >= 0.35) {
      direction = 'up';
    } else {
      direction = 'stable';
    }
  }

  const goalDelta =
    user.weightKg !== null && user.targetWeightKg !== null ? round(user.targetWeightKg - user.weightKg, 2) : null;
  const goalRequiresMovement = goalDelta !== null && Math.abs(goalDelta) >= 1;

  const stagnationRisk: RiskLevel =
    goalRequiresMovement && direction === 'stable' && (adherenceRate ?? 0) >= 0.6
      ? 'high'
      : goalRequiresMovement && direction === 'stable'
        ? 'medium'
        : 'low';

  const workoutAdjustment: AdjustmentLevel =
    adherenceRate === null
      ? 'maintain'
      : adherenceRate < 0.55
        ? 'reduce'
        : adherenceRate > 0.95
          ? 'increase'
          : 'maintain';

  const nutritionAdjustment: AdjustmentLevel =
    nutritionConsistencyRate < 0.5 ? 'reduce' : nutritionConsistencyRate > 0.85 ? 'increase' : 'maintain';

  const { completion, missingProfileFields } = computeProfileCompletion(user);

  return {
    profile: {
      sex: (user.sex as PersonalizationSnapshot['profile']['sex']) ?? null,
      age: user.age,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      targetWeightKg: user.targetWeightKg,
      timeframeWeeks: user.timeframeWeeks,
      trainingDaysPerWeek: user.trainingDaysPerWeek,
      trainingGoal: (user.trainingGoal as PersonalizationSnapshot['profile']['trainingGoal']) ?? null,
      preferredTrainingEnvironment: (user.preferredTrainingEnvironment as PersonalizationSnapshot['profile']['preferredTrainingEnvironment']) ?? null,
      experienceLevel: (user.experienceLevel as PersonalizationSnapshot['profile']['experienceLevel']) ?? null,
      limitations: user.limitations ?? [],
      onboardingCompletedAt: user.onboardingCompletedAt,
    },
    profileCompletion: completion,
    missingProfileFields,
    workoutsLast7Days,
    workoutsLast28Days,
    weeklyTarget,
    adherenceRate: adherenceRate === null ? null : round(adherenceRate),
    averageSessionDuration,
    preferredMuscleGroups,
    nutritionLogDaysLast7,
    nutritionConsistencyRate,
    weightTrend: {
      direction,
      deltaKg: weightTrend,
    },
    stagnationRisk,
    workoutAdjustment,
    nutritionAdjustment,
  };
}
