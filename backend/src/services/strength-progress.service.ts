import { prisma } from '../config/database';

export interface StrengthProgressSet {
  sessionId: string;
  completedAt: Date;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  reps: number;
  weight: number;
  rir: number | null;
  rpe: number | null;
  restSeconds: number | null;
  estimatedOneRepMax: number;
  volume: number;
}

function roundMetric(value: number) {
  return Math.round(value * 100) / 100;
}

export function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }

  const epley = weight * (1 + reps / 30);
  const brzycki = reps >= 37 ? epley : (weight * 36) / (37 - reps);

  return roundMetric(Math.max(epley, brzycki));
}

export async function recordStrengthProgressForSession(userId: string, sessionId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  if (!session) {
    return;
  }

  const muscleVolume = new Map<string, { totalVolume: number; setCount: number }>();

  for (const sessionExercise of session.exercises) {
    let bestEstimatedSet:
      | {
          reps: number;
          weight: number;
          estimatedOneRepMax: number;
        }
      | null = null;
    let maxWeight = 0;

    for (const set of sessionExercise.sets) {
      const volume = set.reps * set.weight;
      const estimatedOneRepMax = estimateOneRepMax(set.weight, set.reps);
      const currentVolume = muscleVolume.get(sessionExercise.exercise.muscleGroup) ?? {
        totalVolume: 0,
        setCount: 0,
      };

      muscleVolume.set(sessionExercise.exercise.muscleGroup, {
        totalVolume: currentVolume.totalVolume + volume,
        setCount: currentVolume.setCount + 1,
      });

      maxWeight = Math.max(maxWeight, set.weight);

      if (
        !bestEstimatedSet ||
        estimatedOneRepMax > bestEstimatedSet.estimatedOneRepMax ||
        (estimatedOneRepMax === bestEstimatedSet.estimatedOneRepMax && set.weight > bestEstimatedSet.weight)
      ) {
        bestEstimatedSet = {
          reps: set.reps,
          weight: set.weight,
          estimatedOneRepMax,
        };
      }
    }

    if (bestEstimatedSet) {
      const existingRecord = await prisma.personalRecord.findUnique({
        where: {
          userId_exerciseId: {
            userId,
            exerciseId: sessionExercise.exerciseId,
          },
        },
      });

      const shouldUpdate =
        !existingRecord ||
        bestEstimatedSet.estimatedOneRepMax > existingRecord.bestEstimatedOneRepMax ||
        maxWeight > existingRecord.maxWeight;

      if (shouldUpdate) {
        await prisma.personalRecord.upsert({
          where: {
            userId_exerciseId: {
              userId,
              exerciseId: sessionExercise.exerciseId,
            },
          },
          update: {
            maxWeight: Math.max(existingRecord?.maxWeight ?? 0, maxWeight),
            bestEstimatedOneRepMax: Math.max(
              existingRecord?.bestEstimatedOneRepMax ?? 0,
              bestEstimatedSet.estimatedOneRepMax
            ),
            reps: bestEstimatedSet.reps,
            weight: bestEstimatedSet.weight,
            achievedAt: session.completedAt,
          },
          create: {
            userId,
            exerciseId: sessionExercise.exerciseId,
            maxWeight,
            bestEstimatedOneRepMax: bestEstimatedSet.estimatedOneRepMax,
            reps: bestEstimatedSet.reps,
            weight: bestEstimatedSet.weight,
            achievedAt: session.completedAt,
          },
        });
      }
    }
  }

  for (const [muscleGroup, value] of muscleVolume) {
    await prisma.muscleVolume.upsert({
      where: {
        sessionId_muscleGroup: {
          sessionId,
          muscleGroup,
        },
      },
      update: {
        totalVolume: roundMetric(value.totalVolume),
        setCount: value.setCount,
      },
      create: {
        userId,
        sessionId,
        muscleGroup,
        totalVolume: roundMetric(value.totalVolume),
        setCount: value.setCount,
      },
    });
  }
}

export async function getStrengthProgress(userId: string) {
  const [personalRecords, muscleVolumes, recentSessions] = await Promise.all([
    prisma.personalRecord.findMany({
      where: { userId },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            muscleGroup: true,
          },
        },
      },
      orderBy: [{ bestEstimatedOneRepMax: 'desc' }, { maxWeight: 'desc' }],
    }),
    prisma.muscleVolume.groupBy({
      by: ['muscleGroup'],
      where: { userId },
      _sum: {
        totalVolume: true,
        setCount: true,
      },
      orderBy: {
        _sum: {
          totalVolume: 'desc',
        },
      },
    }),
    prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
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
              orderBy: { order: 'desc' },
            },
          },
        },
      },
    }),
  ]);

  const recentSets = recentSessions.flatMap((session) =>
    session.exercises.flatMap((sessionExercise) =>
      sessionExercise.sets.map((set): StrengthProgressSet => {
        const estimatedOneRepMax = estimateOneRepMax(set.weight, set.reps);
        const volume = roundMetric(set.reps * set.weight);

        return {
          sessionId: session.id,
          completedAt: session.completedAt,
          exerciseId: sessionExercise.exercise.id,
          exerciseName: sessionExercise.exercise.name,
          muscleGroup: sessionExercise.exercise.muscleGroup,
          reps: set.reps,
          weight: set.weight,
          rir: set.rir,
          rpe: set.rpe,
          restSeconds: set.restSeconds,
          estimatedOneRepMax,
          volume,
        };
      })
    )
  );

  const totalVolume = roundMetric(recentSets.reduce((sum, set) => sum + set.volume, 0));

  return {
    totalVolume,
    personalRecords: personalRecords.map((record) => ({
      id: record.id,
      exerciseId: record.exerciseId,
      exerciseName: record.exercise.name,
      muscleGroup: record.exercise.muscleGroup,
      maxWeight: record.maxWeight,
      bestEstimatedOneRepMax: record.bestEstimatedOneRepMax,
      reps: record.reps,
      weight: record.weight,
      achievedAt: record.achievedAt,
    })),
    muscleVolume: muscleVolumes.map((entry) => ({
      muscleGroup: entry.muscleGroup,
      totalVolume: roundMetric(entry._sum.totalVolume ?? 0),
      setCount: entry._sum.setCount ?? 0,
    })),
    recentSets,
  };
}
