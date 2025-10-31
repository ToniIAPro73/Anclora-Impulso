import { PrismaClient } from '@prisma/client';
import { completeExercisesDatabase } from './complete-exercises-database';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar ejercicios existentes
  console.log('🗑️  Limpiando ejercicios existentes...');
  await prisma.exercise.deleteMany();

  // Insertar todos los ejercicios de la base de datos completa
  console.log(`📝 Insertando ${completeExercisesDatabase.length} ejercicios...`);
  
  for (const exercise of completeExercisesDatabase) {
    await prisma.exercise.create({
      data: {
        name: exercise.name,
        category: exercise.category,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
        instructions: exercise.instructions,
        imageUrl: exercise.imageFileName 
          ? `/exercises/${exercise.imageFileName}` 
          : null,
        videoUrl: null, // Se puede agregar en el futuro
      },
    });
  }

  console.log('✅ Seed completado exitosamente!');
  console.log(`📊 Total de ejercicios insertados: ${completeExercisesDatabase.length}`);
  
  // Mostrar estadísticas
  console.log('\n📈 Estadísticas:');
  console.log(`  - Pecho: ${completeExercisesDatabase.filter(e => e.muscleGroup === 'Pecho').length}`);
  console.log(`  - Espalda: ${completeExercisesDatabase.filter(e => e.muscleGroup === 'Espalda').length}`);
  console.log(`  - Piernas: ${completeExercisesDatabase.filter(e => e.muscleGroup === 'Piernas').length}`);
  console.log(`  - Hombros: ${completeExercisesDatabase.filter(e => e.muscleGroup === 'Hombros').length}`);
  console.log(`  - Brazos: ${completeExercisesDatabase.filter(e => e.muscleGroup === 'Brazos').length}`);
  console.log(`  - Core: ${completeExercisesDatabase.filter(e => e.muscleGroup === 'Core').length}`);
  console.log(`  - Cuerpo completo: ${completeExercisesDatabase.filter(e => e.muscleGroup === 'Cuerpo completo').length}`);
  
  console.log('\n🎨 Ejercicios con imágenes:');
  const withImages = completeExercisesDatabase.filter(e => e.imageFileName).length;
  console.log(`  - Con imágenes: ${withImages}`);
  console.log(`  - Sin imágenes: ${completeExercisesDatabase.length - withImages}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
