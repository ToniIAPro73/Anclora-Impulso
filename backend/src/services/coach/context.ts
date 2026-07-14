import { prisma } from '../../config/database';
import { getPersonalizationSnapshot } from '../personalization.service';

function valueOrUnknown(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'unknown';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'none';
  }

  return String(value);
}

export async function buildCoachContext(userId: string) {
  const [snapshot, records, recentSessions] = await Promise.all([
    getPersonalizationSnapshot(userId),
    prisma.personalRecord.findMany({
      where: { userId },
      orderBy: { achievedAt: 'desc' },
      take: 5,
      include: {
        exercise: {
          select: {
            name: true,
            muscleGroup: true,
          },
        },
      },
    }),
    prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        completedAt: true,
        duration: true,
      },
    }),
  ]);

  const prSummary = records.length
    ? records
        .map((record) => `${record.exercise.name}:${record.weight}kgx${record.reps}`)
        .join(', ')
    : 'none';
  const recentSessionSummary = recentSessions.length
    ? recentSessions
        .map((session) => `${session.completedAt.toISOString().slice(0, 10)}:${Math.round(session.duration / 60)}min`)
        .join(', ')
    : 'none';

  return [
    'User bounded context:',
    `trainingGoal=${valueOrUnknown(snapshot.profile.trainingGoal)};`,
    `experienceLevel=${valueOrUnknown(snapshot.profile.experienceLevel)};`,
    `trainingDaysPerWeek=${valueOrUnknown(snapshot.profile.trainingDaysPerWeek)};`,
    `limitations=${valueOrUnknown(snapshot.profile.limitations)};`,
    `adherenceRate=${valueOrUnknown(snapshot.adherenceRate)};`,
    `workoutsLast7Days=${snapshot.workoutsLast7Days};`,
    `workoutsLast28Days=${snapshot.workoutsLast28Days};`,
    `nutritionConsistencyRate=${valueOrUnknown(snapshot.nutritionConsistencyRate)};`,
    `stagnationRisk=${snapshot.stagnationRisk};`,
    `workoutAdjustment=${snapshot.workoutAdjustment};`,
    `nutritionAdjustment=${snapshot.nutritionAdjustment};`,
    `recentPRs=${prSummary};`,
    `recentSessions=${recentSessionSummary};`,
  ].join('\n');
}
