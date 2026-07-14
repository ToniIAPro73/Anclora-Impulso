import type {
  DeloadDecision,
  FreshnessInput,
  NextPrescriptionResult,
  Prescription,
  ProgressionState,
  RecoveryAction,
  RepFocus,
  RepScheme,
  SessionResult,
} from './types';

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function incrementForPattern(pattern: SessionResult['exercisePattern']) {
  if (pattern === 'lower_compound') {
    return 5;
  }

  if (pattern === 'upper_compound') {
    return 2.5;
  }

  return 1;
}

export function nextPrescription(state: ProgressionState, sessionResult: SessionResult): NextPrescriptionResult {
  const minReps = state.targetRepRange.minReps;
  const maxReps = state.targetRepRange.maxReps;
  const allSetsAtMax = sessionResult.reps.every((reps) => reps >= maxReps);
  const hitMinInAllSets = sessionResult.reps.every((reps) => reps >= minReps);
  const updatedState: ProgressionState = {
    ...state,
    lastSessionReps: [...sessionResult.reps],
    lastSessionRIR: sessionResult.averageRir,
  };

  let weight = state.currentWeight;
  let action: Prescription['action'] = 'maintain';
  const reasons: string[] = [];
  let repRange = state.targetRepRange;

  if (sessionResult.averageRir <= 0 && !hitMinInAllSets) {
    updatedState.consecutiveStalls += 1;
    updatedState.consecutiveSuccesses = 0;
    reasons.push('Max-effort miss below the minimum rep target; repeat the load.');
  } else if (allSetsAtMax) {
    weight = roundToHalf(state.currentWeight + incrementForPattern(sessionResult.exercisePattern));
    action = 'increase_load';
    updatedState.consecutiveSuccesses += 1;
    updatedState.consecutiveStalls = 0;
    reasons.push('All sets reached the top of the target range; increase load.');
  } else if (hitMinInAllSets) {
    const nextMinTarget = clamp(Math.min(...sessionResult.reps) + 1, minReps, maxReps);
    repRange = { minReps: nextMinTarget, maxReps };
    updatedState.consecutiveSuccesses = 0;
    reasons.push('All sets are inside the target range; keep load and add reps.');
  } else {
    updatedState.consecutiveStalls += 1;
    updatedState.consecutiveSuccesses = 0;
    reasons.push('Some sets missed the minimum target; repeat the load.');
  }

  updatedState.currentWeight = weight;

  return {
    prescription: {
      exerciseId: state.exerciseId,
      weight,
      repRange,
      sets: sessionResult.sets,
      targetRIR: 2,
      focus: 'HYPERTROPHY',
      action,
      reasons,
    },
    updatedState,
  };
}

export function evaluateDeload(state: ProgressionState, now: Date): DeloadDecision {
  if (state.consecutiveStalls >= 3) {
    return { shouldDeload: true, reason: 'stall' };
  }

  if (state.lastDeloadAt) {
    const weeksSinceLastDeload = (now.getTime() - state.lastDeloadAt.getTime()) / (7 * 24 * 60 * 60 * 1000);

    if (weeksSinceLastDeload >= 6) {
      return { shouldDeload: true, reason: 'scheduled' };
    }
  }

  return { shouldDeload: false, reason: 'none' };
}

export function applyDeload(prescription: Prescription): Prescription {
  return {
    ...prescription,
    weight: roundToHalf(prescription.weight * 0.9),
    sets: Math.max(1, Math.ceil(prescription.sets * 0.67)),
    targetRIR: 3,
    action: 'deload',
    reasons: [...prescription.reasons, 'Deload applied: reduce load and volume for recovery.'],
  };
}

export function freshnessScore(input: FreshnessInput) {
  if (!input.lastTrainedAt) {
    return 100;
  }

  const baseRecoveryHours = input.baseRecoveryHours ?? 72;
  const referenceVolume = input.referenceVolume ?? 3000;
  const hoursSinceTraining = (input.now.getTime() - input.lastTrainedAt.getTime()) / (60 * 60 * 1000);
  const volumeFactor = clamp(input.lastVolume / referenceVolume, 0.5, 1.5);
  const adjustedRecoveryHours = baseRecoveryHours * volumeFactor;
  const recovered = clamp(hoursSinceTraining / adjustedRecoveryHours, 0, 1);

  return Math.round(recovered * 100);
}

export function recoveryActionForFreshness(score: number): RecoveryAction {
  if (score < 50) {
    return 'substitute_or_reduce';
  }

  if (score >= 80) {
    return 'prioritize';
  }

  return 'normal';
}

export function applyPeriodization(state: ProgressionState, _weekIndex: number, sessionIndex: number): RepScheme {
  if (state.strategy === 'DUP') {
    const phase = ((sessionIndex % 3) + 3) % 3;

    if (phase === 0) {
      return { repRange: { minReps: 3, maxReps: 5 }, focus: 'STRENGTH', targetRIR: 1 };
    }

    if (phase === 1) {
      return { repRange: { minReps: 8, maxReps: 12 }, focus: 'HYPERTROPHY', targetRIR: 2 };
    }

    return { repRange: { minReps: 15, maxReps: 20 }, focus: 'ENDURANCE', targetRIR: 3 };
  }

  return { repRange: state.targetRepRange, focus: 'HYPERTROPHY' as RepFocus, targetRIR: 2 };
}
