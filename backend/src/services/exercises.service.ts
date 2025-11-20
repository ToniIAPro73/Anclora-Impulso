import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { CreateExerciseInput } from '../utils/validators';

export interface ExerciseFilters {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
}

/**
 * Obtener todos los ejercicios con filtros opcionales
 */
export async function getAllExercises(filters: ExerciseFilters = {}) {
  const where: any = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.muscleGroup) {
    where.muscleGroup = filters.muscleGroup;
  }

  if (filters.equipment) {
    where.equipment = filters.equipment;
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return exercises;
}

/**
 * Obtener un ejercicio por ID
 */
export async function getExerciseById(id: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise) {
    throw new AppError(404, 'Ejercicio no encontrado');
  }

  return exercise;
}

/**
 * Crear un nuevo ejercicio
 */
export async function createExercise(data: CreateExerciseInput) {
  const exercise = await prisma.exercise.create({
    data,
  });

  return exercise;
}

/**
 * Actualizar un ejercicio
 */
export async function updateExercise(id: string, data: Partial<CreateExerciseInput>) {
  const exercise = await prisma.exercise.update({
    where: { id },
    data,
  });

  return exercise;
}

/**
 * Eliminar un ejercicio
 */
export async function deleteExercise(id: string) {
  await prisma.exercise.delete({
    where: { id },
  });
}

/**
 * Obtener categorías únicas
 */
export async function getCategories() {
  const exercises = await prisma.exercise.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  return exercises.map((e) => e.category);
}

/**
 * Obtener grupos musculares únicos
 */
export async function getMuscleGroups() {
  const exercises = await prisma.exercise.findMany({
    select: { muscleGroup: true },
    distinct: ['muscleGroup'],
  });

  return exercises.map((e) => e.muscleGroup);
}

/**
 * Obtener equipos únicos
 */
export async function getEquipment() {
  const exercises = await prisma.exercise.findMany({
    select: { equipment: true },
    distinct: ['equipment'],
  });

  return exercises.map((e) => e.equipment);
}
