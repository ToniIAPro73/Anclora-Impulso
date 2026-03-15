import { PrismaClient } from '@prisma/client';
import { buildNormalizedExercises } from './exercise-classification';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar ejercicios existentes
  console.log('🗑️  Limpiando ejercicios existentes...');
  await prisma.exercise.deleteMany();

  // Insertar todos los ejercicios de la base de datos completa
  const exercises = buildNormalizedExercises();
  console.log(`📝 Insertando ${exercises.length} ejercicios...`);
  
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise,
    });
  }

  console.log('✅ Seed completado exitosamente!');
  console.log(`📊 Total de ejercicios insertados: ${exercises.length}`);
  
  // Mostrar estadísticas
  console.log('\n📈 Estadísticas:');
  console.log(`  - Chest: ${exercises.filter(e => e.muscleGroup === 'chest').length}`);
  console.log(`  - Back: ${exercises.filter(e => e.muscleGroup === 'back').length}`);
  console.log(`  - Legs: ${exercises.filter(e => e.muscleGroup === 'legs').length}`);
  console.log(`  - Shoulders: ${exercises.filter(e => e.muscleGroup === 'shoulders').length}`);
  console.log(`  - Arms: ${exercises.filter(e => e.muscleGroup === 'arms').length}`);
  console.log(`  - Core: ${exercises.filter(e => e.muscleGroup === 'core').length}`);
  console.log(`  - Full body: ${exercises.filter(e => e.muscleGroup === 'full_body').length}`);
  
  console.log('\n🎨 Ejercicios con imágenes:');
  const withImages = exercises.filter(e => e.imageUrl).length;
  console.log(`  - Con imágenes: ${withImages}`);
  console.log(`  - Sin imágenes: ${exercises.length - withImages}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
