import { completeExercisesDatabase, type ExerciseData } from './complete-exercises-database';

export type TrainingEnvironment = 'gym' | 'home' | 'outdoor';

export interface NormalizedExerciseSeed {
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string[];
  imageUrl: string | null;
  trainingEnvironments: TrainingEnvironment[];
}

export function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function mapCategory(category: string) {
  const normalized = normalizeToken(category);

  if (normalized.includes('cardio')) return 'cardio';
  if (normalized.includes('flex')) return 'flexibility';
  if (normalized.includes('balance')) return 'balance';
  if (normalized.includes('pliometr')) return 'hiit';
  return 'strength';
}

export function mapMuscleGroup(muscleGroup: string) {
  const normalized = normalizeToken(muscleGroup);

  if (normalized.includes('pecho')) return 'chest';
  if (normalized.includes('espalda')) return 'back';
  if (normalized.includes('hombro')) return 'shoulders';
  if (normalized.includes('bicep') || normalized.includes('tricep') || normalized.includes('brazo')) return 'arms';
  if (normalized.includes('pierna') || normalized.includes('cuadricep') || normalized.includes('isquio')) return 'legs';
  if (normalized.includes('glute')) return 'glutes';
  if (normalized.includes('core') || normalized.includes('abd') || normalized.includes('oblic')) return 'core';
  return 'full_body';
}

export function mapEquipment(equipment: string) {
  const normalized = normalizeToken(equipment);

  if (normalized.includes('peso corporal') || normalized === 'ninguno') return 'bodyweight';
  if (normalized.includes('mancuerna')) return 'dumbbells';
  if (normalized.includes('barra landmine')) return 'landmine';
  if (normalized.includes('barra de dominadas')) return 'pull_up_bar';
  if (normalized.includes('barra t')) return 't_bar';
  if (normalized.includes('barra baja')) return 'smith_bar';
  if (normalized.includes('barra')) return 'barbell';
  if (normalized.includes('kettlebell')) return 'kettlebell';
  if (normalized.includes('cable')) return 'cables';
  if (normalized.includes('maquina')) return 'machine';
  if (normalized.includes('banda')) return 'resistance_bands';
  if (normalized.includes('barras paralelas')) return 'dip_bars';
  if (normalized.includes('banco de hiperextensiones')) return 'hyperextension_bench';
  if (normalized.includes('banco inclinado')) return 'incline_bench';
  if (normalized === 'banco') return 'bench';
  if (normalized.includes('disco')) return 'weight_plate';
  if (normalized.includes('cajon')) return 'plyo_box';
  if (normalized.includes('predicador')) return 'preacher_bench';
  if (normalized.includes('rueda abdominal')) return 'ab_wheel';
  if (normalized.includes('cuerda de saltar')) return 'jump_rope';
  if (normalized.includes('cuerdas de batalla')) return 'battle_ropes';
  if (normalized.includes('remo')) return 'rowing_machine';
  if (normalized.includes('escaleras')) return 'stairs';
  if (normalized.includes('bicicleta de asalto')) return 'assault_bike';
  return normalized.replace(/\s+/g, '_');
}

export function mapDifficulty(difficulty: string) {
  const normalized = normalizeToken(difficulty);

  if (normalized.includes('principiante')) return 'beginner';
  if (normalized.includes('intermedio')) return 'intermediate';
  if (normalized.includes('avanzado')) return 'advanced';
  return 'beginner';
}

const homeFriendlyEquipment = new Set(['bodyweight', 'dumbbells', 'resistance_bands']);

const outdoorPriorityNames = new Set([
  'sprint intervals',
  'stair climbing',
  'jump rope',
  'pull-ups',
  'chin-ups',
  'hanging knee raises',
  'high knees',
  'battle ropes',
  'brisk walk intervals',
  'tempo brisk walk intervals',
  'hill walk intervals',
  'tempo hill walk intervals',
  'stair climb intervals',
  'tempo stair climb intervals',
  'park bench sit-to-stand',
  'tempo park bench sit-to-stand',
  'park bench incline push-ups',
  'tempo park bench incline push-ups',
  'outdoor resistance band row',
  'tempo outdoor resistance band row',
  'outdoor resistance band chest press',
  'tempo outdoor resistance band chest press',
  'outdoor pallof press walkout',
  'tempo outdoor pallof press walkout',
  'marching high knees walk',
  'tempo marching high knees walk',
  'low impact skater step',
  'tempo low impact skater step',
  'outdoor farmer carry march',
  'tempo outdoor farmer carry march',
]);

function deriveTrainingEnvironments(exercise: ExerciseData): TrainingEnvironment[] {
  const mappedEquipment = mapEquipment(exercise.equipment);
  const normalizedName = normalizeToken(exercise.name);

  if (outdoorPriorityNames.has(normalizedName) || ['jump_rope', 'stairs', 'pull_up_bar'].includes(mappedEquipment)) {
    return ['outdoor'];
  }

  if (homeFriendlyEquipment.has(mappedEquipment)) {
    return ['home'];
  }

  return ['gym'];
}

export function normalizeExerciseSeed(exercise: ExerciseData): NormalizedExerciseSeed {
  return {
    name: exercise.name,
    category: mapCategory(exercise.category),
    muscleGroup: mapMuscleGroup(exercise.muscleGroup),
    equipment: mapEquipment(exercise.equipment),
    difficulty: mapDifficulty(exercise.difficulty),
    description: exercise.description,
    instructions: exercise.instructions,
    imageUrl: exercise.imageFileName ? `/exercises/${exercise.imageFileName}` : null,
    trainingEnvironments: deriveTrainingEnvironments(exercise),
  };
}

export function buildNormalizedExercises() {
  return completeExercisesDatabase.map(normalizeExerciseSeed);
}
