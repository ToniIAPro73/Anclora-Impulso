import { PrismaClient } from '@prisma/client';
import { completeExercisesDatabase } from './complete-exercises-database';

const prisma = new PrismaClient();

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function mapCategory(category: string) {
  const normalized = normalizeToken(category);

  if (normalized.includes('cardio')) return 'cardio';
  if (normalized.includes('flex')) return 'flexibility';
  if (normalized.includes('balance')) return 'balance';
  return 'strength';
}

function mapMuscleGroup(muscleGroup: string) {
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

function mapEquipment(equipment: string) {
  const normalized = normalizeToken(equipment);

  if (normalized.includes('peso corporal')) return 'bodyweight';
  if (normalized.includes('mancuerna')) return 'dumbbells';
  if (normalized.includes('barra')) return 'barbell';
  if (normalized.includes('kettlebell')) return 'kettlebell';
  if (normalized.includes('cable')) return 'cables';
  if (normalized.includes('maquina')) return 'machine';
  if (normalized.includes('banda')) return 'resistance_bands';
  if (normalized.includes('barra de dominadas')) return 'pull_up_bar';
  return normalized.replace(/\s+/g, '_');
}

function mapDifficulty(difficulty: string) {
  const normalized = normalizeToken(difficulty);

  if (normalized.includes('principiante')) return 'beginner';
  if (normalized.includes('intermedio')) return 'intermediate';
  if (normalized.includes('avanzado')) return 'advanced';
  return 'beginner';
}

function normalizeExercises() {
  return completeExercisesDatabase.map((exercise) => ({
    name: exercise.name,
    category: mapCategory(exercise.category),
    muscleGroup: mapMuscleGroup(exercise.muscleGroup),
    equipment: mapEquipment(exercise.equipment),
    difficulty: mapDifficulty(exercise.difficulty),
    description: exercise.description,
    instructions: exercise.instructions,
    imageUrl: exercise.imageFileName ? `/exercises/${exercise.imageFileName}` : null,
  }));
}

async function main() {
  console.log('🌱 Iniciando seed de ejercicios...');

  const normalizedExercises = normalizeExercises();
  const existingExercises = await prisma.exercise.findMany({
    select: { name: true },
  });
  const existingNames = new Set(existingExercises.map((exercise) => exercise.name));

  const missingExercises = normalizedExercises.filter((exercise) => !existingNames.has(exercise.name));

  if (missingExercises.length === 0) {
    console.log(`ℹ️  Ya existen ${existingExercises.length} ejercicios en la base de datos`);
    return;
  }

  console.log(`📝 Añadiendo ${missingExercises.length} ejercicios...`);

  for (const exercise of missingExercises) {
    await prisma.exercise.create({
      data: exercise,
    });
  }

  console.log(`✅ Seed completado. Total actual: ${existingExercises.length + missingExercises.length} ejercicios`);
}

main()
  .catch((error) => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
