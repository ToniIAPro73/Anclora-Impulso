import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  {
    name: 'Push-ups',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Classic upper body exercise',
    instructions: ['Start in plank position', 'Lower body to ground', 'Push back up'],
  },
  {
    name: 'Squats',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Fundamental lower body exercise',
    instructions: ['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Return to standing'],
  },
  {
    name: 'Pull-ups',
    category: 'strength',
    muscleGroup: 'back',
    equipment: 'pull_up_bar',
    difficulty: 'intermediate',
    description: 'Upper body pulling exercise',
    instructions: ['Hang from bar with overhand grip', 'Pull body up until chin over bar', 'Lower with control'],
  },
  {
    name: 'Plank',
    category: 'strength',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Core stability exercise',
    instructions: ['Start in forearm plank position', 'Keep body straight', 'Hold position'],
  },
  {
    name: 'Lunges',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Single-leg lower body exercise',
    instructions: ['Step forward with one leg', 'Lower hips until both knees bent at 90°', 'Return to start'],
  },
  {
    name: 'Burpees',
    category: 'cardio',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Full body cardio exercise',
    instructions: ['Start standing', 'Drop to plank', 'Do push-up', 'Jump feet to hands', 'Jump up'],
  },
  {
    name: 'Dumbbell Bench Press',
    category: 'strength',
    muscleGroup: 'chest',
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    description: 'Chest pressing exercise with dumbbells',
    instructions: ['Lie on bench with dumbbells', 'Press weights up', 'Lower with control'],
  },
  {
    name: 'Deadlifts',
    category: 'strength',
    muscleGroup: 'back',
    equipment: 'barbell',
    difficulty: 'advanced',
    description: 'Compound posterior chain exercise',
    instructions: ['Stand with feet hip-width', 'Grip barbell', 'Lift by extending hips and knees'],
  },
  {
    name: 'Mountain Climbers',
    category: 'cardio',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Dynamic cardio and core exercise',
    instructions: ['Start in plank position', 'Alternate bringing knees to chest', 'Keep core engaged'],
  },
  {
    name: 'Dumbbell Rows',
    category: 'strength',
    muscleGroup: 'back',
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    description: 'Back pulling exercise',
    instructions: ['Bend at hips with dumbbell', 'Pull weight to hip', 'Lower with control'],
  },
  {
    name: 'Shoulder Press',
    category: 'strength',
    muscleGroup: 'shoulders',
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    description: 'Overhead pressing exercise',
    instructions: ['Hold dumbbells at shoulder height', 'Press overhead', 'Lower with control'],
  },
  {
    name: 'Bicycle Crunches',
    category: 'strength',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Core rotation exercise',
    instructions: ['Lie on back', 'Alternate elbow to opposite knee', 'Keep core engaged'],
  },
  {
    name: 'Jumping Jacks',
    category: 'cardio',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Classic cardio warm-up exercise',
    instructions: ['Start with feet together', 'Jump feet apart while raising arms', 'Return to start'],
  },
  {
    name: 'Tricep Dips',
    category: 'strength',
    muscleGroup: 'arms',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Tricep isolation exercise',
    instructions: ['Support body on parallel bars or bench', 'Lower body by bending elbows', 'Push back up'],
  },
  {
    name: 'Russian Twists',
    category: 'strength',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Oblique strengthening exercise',
    instructions: ['Sit with knees bent, lean back slightly', 'Rotate torso side to side', 'Keep core engaged'],
  },
  {
    name: 'Box Jumps',
    category: 'cardio',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Explosive lower body exercise',
    instructions: ['Stand in front of box', 'Jump onto box', 'Step down and repeat'],
  },
  {
    name: 'Barbell Squats',
    category: 'strength',
    muscleGroup: 'legs',
    equipment: 'barbell',
    difficulty: 'advanced',
    description: 'Compound leg exercise with barbell',
    instructions: ['Position barbell on upper back', 'Squat down keeping chest up', 'Drive through heels to stand'],
  },
  {
    name: 'Leg Raises',
    category: 'strength',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    description: 'Lower abdominal exercise',
    instructions: ['Lie on back', 'Raise legs to 90 degrees', 'Lower with control'],
  },
  {
    name: 'Kettlebell Swings',
    category: 'strength',
    muscleGroup: 'glutes',
    equipment: 'kettlebell',
    difficulty: 'intermediate',
    description: 'Dynamic posterior chain exercise',
    instructions: ['Stand with feet wide', 'Swing kettlebell between legs', 'Drive hips forward to swing up'],
  },
  {
    name: 'High Knees',
    category: 'cardio',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    description: 'Cardio exercise with high knee drive',
    instructions: ['Run in place', 'Drive knees up high', 'Maintain quick pace'],
  },
];

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Verificar si ya existen ejercicios
  const existingExercises = await prisma.exercise.count();

  if (existingExercises > 0) {
    console.log(`ℹ️  Ya existen ${existingExercises} ejercicios en la base de datos`);
    console.log('💡 Saltando seed de ejercicios');
    return;
  }

  // Crear ejercicios
  console.log('📝 Creando ejercicios...');
  
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise,
    });
  }

  console.log(`✅ Se crearon ${exercises.length} ejercicios exitosamente`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
