import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import {
  applyDeload,
  applyPeriodization,
  evaluateDeload,
  freshnessScore,
  nextPrescription,
  recoveryActionForFreshness,
} from './engine';
import type { ProgressionPlannedExercise, ProgressionState, SessionPlan } from './types';

function toProgressionState(record: {
  userId: string;
  exerciseId: string;
  currentWeight: number;
  targetMinReps: number;
  targetMaxReps: number;
  lastSessionReps: number[];
  lastSessionRIR: number | null;
  consecutiveSuccesses: number;
  consecutiveStalls: number;
  lastTrainedAt: Date | null;
  strategy: string;
  deloadActive: boolean;
  lastDeloadAt: Date | null;
}): ProgressionState {
  return {
    userId: record.userId,
    exerciseId: record.exerciseId,
    currentWeight: record.currentWeight,
    targetRepRange: {
      minReps: record.targetMinReps,
      maxReps: record.targetMaxReps,
    },
    lastSessionReps: record.lastSessionReps,
    lastSessionRIR: record.lastSessionRIR,
    consecutiveSuccesses: record.consecutiveSuccesses,
    consecutiveStalls: record.consecutiveStalls,
    lastTrainedAt: record.lastTrainedAt,
    strategy: record.strategy === 'DUP' ? 'DUP' : 'LINEAR',
    deloadActive: record.deloadActive,
    lastDeloadAt: record.lastDeloadAt,
  };
}

async function loadOrCreateState(userId: string, plannedExercise: ProgressionPlannedExercise) {
  const existing = await prisma.exerciseProgressionState.findUnique({
    where: {
      userId_exerciseId: {
        userId,
        exerciseId: plannedExercise.exerciseId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  if (plannedExercise.currentWeight === undefined) {
    throw new AppError(400, 'currentWeight is required for exercises without progression state');
  }

  const targetRepRange = plannedExercise.targetRepRange ?? { minReps: 8, maxReps: 12 };

  return prisma.exerciseProgressionState.create({
    data: {
      userId,
      exerciseId: plannedExercise.exerciseId,
      currentWeight: plannedExercise.currentWeight,
      targetMinReps: targetRepRange.minReps,
      targetMaxReps: targetRepRange.maxReps,
      lastSessionReps: plannedExercise.sessionResult?.reps ?? [],
      lastSessionRIR: plannedExercise.sessionResult?.averageRir ?? null,
      strategy: 'LINEAR',
    },
  });
}

async function getExerciseMuscleGroup(exerciseId: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { muscleGroup: true },
  });

  return exercise?.muscleGroup ?? null;
}

export interface GenerateNextSessionInput {
  now?: string;
  weekIndex?: number;
  sessionIndex?: number;
  plannedExercises: ProgressionPlannedExercise[];
}

export async function generateNextSession(userId: string, input: GenerateNextSessionInput): Promise<SessionPlan> {
  const now = input.now ? new Date(input.now) : new Date();
  const weekIndex = input.weekIndex ?? 0;
  const sessionIndex = input.sessionIndex ?? 0;
  const prescriptions = [];

  for (const plannedExercise of input.plannedExercises) {
    const record = await loadOrCreateState(userId, plannedExercise);
    let state = toProgressionState(record);
    const sessionResult = plannedExercise.sessionResult
      ? {
          reps: plannedExercise.sessionResult.reps,
          averageRir: plannedExercise.sessionResult.averageRir,
          sets: plannedExercise.sets,
          exercisePattern: plannedExercise.exercisePattern,
        }
      : {
          reps: state.lastSessionReps.length ? state.lastSessionReps : [state.targetRepRange.minReps],
          averageRir: state.lastSessionRIR ?? 2,
          sets: plannedExercise.sets,
          exercisePattern: plannedExercise.exercisePattern,
        };

    const next = nextPrescription(state, sessionResult);
    state = next.updatedState;
    let prescription = next.prescription;
    const scheme = applyPeriodization(state, weekIndex, sessionIndex);
    prescription = {
      ...prescription,
      repRange: scheme.repRange,
      focus: scheme.focus,
      targetRIR: scheme.targetRIR,
    };

    const deload = evaluateDeload(state, now);
    if (deload.shouldDeload) {
      prescription = applyDeload(prescription);
      state = {
        ...state,
        currentWeight: prescription.weight,
        consecutiveStalls: 0,
        deloadActive: true,
        lastDeloadAt: now,
      };
    }

    const primaryMuscle = plannedExercise.primaryMuscle ?? (await getExerciseMuscleGroup(plannedExercise.exerciseId)) ?? 'unknown';
    const score = freshnessScore({
      muscleGroup: primaryMuscle,
      now,
      lastTrainedAt: state.lastTrainedAt,
      lastVolume: plannedExercise.lastVolume ?? 0,
    });
    const recoveryAction = recoveryActionForFreshness(score);

    await prisma.exerciseProgressionState.update({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId: plannedExercise.exerciseId,
        },
      },
      data: {
        currentWeight: state.currentWeight,
        targetMinReps: state.targetRepRange.minReps,
        targetMaxReps: state.targetRepRange.maxReps,
        lastSessionReps: state.lastSessionReps,
        lastSessionRIR: state.lastSessionRIR,
        consecutiveSuccesses: state.consecutiveSuccesses,
        consecutiveStalls: state.consecutiveStalls,
        lastTrainedAt: now,
        strategy: state.strategy,
        deloadActive: state.deloadActive,
        lastDeloadAt: state.lastDeloadAt,
      },
    });

    prescriptions.push({
      ...prescription,
      freshnessScore: score,
      recoveryAction,
      deload,
    });
  }

  return {
    generatedAt: now,
    prescriptions,
  };
}
