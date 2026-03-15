import { PrismaClient } from '@prisma/client';
import { buildNormalizedExercises } from './exercise-classification';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de ejercicios...');

  const normalizedExercises = buildNormalizedExercises();
  const normalizedNames = normalizedExercises.map((exercise) => exercise.name);

  await prisma.exercise.deleteMany({
    where: {
      name: {
        notIn: normalizedNames,
      },
    },
  });

  console.log(`📝 Sincronizando ${normalizedExercises.length} ejercicios...`);

  for (const exercise of normalizedExercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: exercise,
      });
      continue;
    }

    await prisma.exercise.create({
      data: exercise,
    });
  }

  const duplicatedGroups = await prisma.exercise.groupBy({
    by: ['name'],
    _count: { name: true },
    having: {
      name: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  for (const group of duplicatedGroups) {
    const duplicates = await prisma.exercise.findMany({
      where: { name: group.name },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    const duplicateIds = duplicates.slice(1).map((exercise) => exercise.id);

    if (duplicateIds.length > 0) {
      await prisma.exercise.deleteMany({
        where: {
          id: {
            in: duplicateIds,
          },
        },
      });
    }
  }

  console.log(`✅ Seed completado. Total sincronizado: ${normalizedExercises.length} ejercicios`);
}

main()
  .catch((error) => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
