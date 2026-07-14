import {
  applyDeload,
  applyPeriodization,
  evaluateDeload,
  freshnessScore,
  nextPrescription,
} from '../../src/services/progression/engine';
import type { ProgressionState } from '../../src/services/progression/types';

const baseState: ProgressionState = {
  userId: 'user-1',
  exerciseId: 'exercise-1',
  currentWeight: 100,
  targetRepRange: { minReps: 8, maxReps: 12 },
  lastSessionReps: [10, 10, 9],
  lastSessionRIR: 2,
  consecutiveSuccesses: 0,
  consecutiveStalls: 0,
  lastTrainedAt: new Date('2026-07-01T10:00:00.000Z'),
  strategy: 'LINEAR',
  deloadActive: false,
  lastDeloadAt: null,
};

describe('progression engine', () => {
  it('increases load when all sets reach the top of the target range', () => {
    const result = nextPrescription(baseState, {
      reps: [12, 12, 12],
      averageRir: 2,
      sets: 3,
      exercisePattern: 'upper_compound',
    });

    expect(result.prescription.weight).toBe(102.5);
    expect(result.updatedState.consecutiveSuccesses).toBe(1);
    expect(result.updatedState.consecutiveStalls).toBe(0);
  });

  it('keeps load and targets one extra rep when sets are inside the range', () => {
    const result = nextPrescription(baseState, {
      reps: [10, 9, 8],
      averageRir: 2,
      sets: 3,
      exercisePattern: 'upper_compound',
    });

    expect(result.prescription.weight).toBe(100);
    expect(result.prescription.repRange).toEqual({ minReps: 9, maxReps: 12 });
    expect(result.updatedState.consecutiveSuccesses).toBe(0);
    expect(result.updatedState.consecutiveStalls).toBe(0);
  });

  it('keeps load and increments stalls after a max-effort miss below minimum reps', () => {
    const result = nextPrescription(baseState, {
      reps: [8, 7, 6],
      averageRir: 0,
      sets: 3,
      exercisePattern: 'upper_compound',
    });

    expect(result.prescription.weight).toBe(100);
    expect(result.updatedState.consecutiveStalls).toBe(1);
    expect(result.updatedState.consecutiveSuccesses).toBe(0);
  });

  it('triggers and applies deload after three stalls', () => {
    const stalledState = { ...baseState, consecutiveStalls: 3 };
    const decision = evaluateDeload(stalledState, new Date('2026-07-14T10:00:00.000Z'));
    const deloaded = applyDeload({
      exerciseId: baseState.exerciseId,
      weight: 100,
      repRange: baseState.targetRepRange,
      sets: 3,
      targetRIR: 2,
      focus: 'HYPERTROPHY',
      action: 'maintain',
      reasons: [],
    });

    expect(decision).toMatchObject({ shouldDeload: true, reason: 'stall' });
    expect(deloaded.weight).toBe(90);
    expect(deloaded.sets).toBe(3);
    expect(deloaded.targetRIR).toBe(3);
  });

  it('returns low freshness for muscles trained heavily too recently', () => {
    const score = freshnessScore({
      muscleGroup: 'chest',
      now: new Date('2026-07-14T10:00:00.000Z'),
      lastTrainedAt: new Date('2026-07-13T10:00:00.000Z'),
      lastVolume: 4500,
      baseRecoveryHours: 72,
      referenceVolume: 3000,
    });

    expect(score).toBeLessThan(50);
  });

  it('returns DUP schemes for strength, hypertrophy, and endurance sessions', () => {
    const dupState = { ...baseState, strategy: 'DUP' as const };

    expect(applyPeriodization(dupState, 1, 0)).toMatchObject({
      repRange: { minReps: 3, maxReps: 5 },
      focus: 'STRENGTH',
      targetRIR: 1,
    });
    expect(applyPeriodization(dupState, 1, 1)).toMatchObject({
      repRange: { minReps: 8, maxReps: 12 },
      focus: 'HYPERTROPHY',
      targetRIR: 2,
    });
    expect(applyPeriodization(dupState, 1, 2)).toMatchObject({
      repRange: { minReps: 15, maxReps: 20 },
      focus: 'ENDURANCE',
      targetRIR: 3,
    });
  });
});
