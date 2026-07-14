export type ProgressionStrategy = 'LINEAR' | 'DUP';
export type ExercisePattern = 'lower_compound' | 'upper_compound' | 'isolation';
export type RepFocus = 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE';
export type PrescriptionAction = 'increase_load' | 'maintain' | 'deload';
export type RecoveryAction = 'normal' | 'prioritize' | 'substitute_or_reduce';

export interface RepRange {
  minReps: number;
  maxReps: number;
}

export interface ProgressionState {
  userId: string;
  exerciseId: string;
  currentWeight: number;
  targetRepRange: RepRange;
  lastSessionReps: number[];
  lastSessionRIR: number | null;
  consecutiveSuccesses: number;
  consecutiveStalls: number;
  lastTrainedAt: Date | null;
  strategy: ProgressionStrategy;
  deloadActive: boolean;
  lastDeloadAt: Date | null;
}

export interface SessionResult {
  reps: number[];
  averageRir: number;
  sets: number;
  exercisePattern: ExercisePattern;
}

export interface Prescription {
  exerciseId: string;
  weight: number;
  repRange: RepRange;
  sets: number;
  targetRIR: number;
  focus: RepFocus;
  action: PrescriptionAction;
  reasons: string[];
}

export interface NextPrescriptionResult {
  prescription: Prescription;
  updatedState: ProgressionState;
}

export interface DeloadDecision {
  shouldDeload: boolean;
  reason: 'none' | 'stall' | 'scheduled';
}

export interface RepScheme {
  repRange: RepRange;
  focus: RepFocus;
  targetRIR: number;
}

export interface FreshnessInput {
  muscleGroup: string;
  now: Date;
  lastTrainedAt: Date | null;
  lastVolume: number;
  baseRecoveryHours?: number;
  referenceVolume?: number;
}

export interface ProgressionPlannedExercise {
  exerciseId: string;
  sets: number;
  currentWeight?: number;
  targetRepRange?: RepRange;
  exercisePattern: ExercisePattern;
  primaryMuscle?: string;
  lastVolume?: number;
  sessionResult?: {
    reps: number[];
    averageRir: number;
  };
}

export interface ReadinessInput {
  readinessScore: number;
  provider?: string;
  recordedAt?: string;
}

export interface SessionPlanPrescription extends Prescription {
  freshnessScore: number;
  readinessScore: number | null;
  recoveryAction: RecoveryAction;
  deload: DeloadDecision;
}

export interface SessionPlan {
  generatedAt: Date;
  prescriptions: SessionPlanPrescription[];
}
