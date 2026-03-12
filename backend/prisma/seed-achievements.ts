import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  {
    key: 'first_workout',
    nameEs: 'Primer Paso',
    nameEn: 'First Step',
    descEs: 'Completa tu primer entrenamiento',
    descEn: 'Complete your first workout',
    icon: 'Dumbbell',
    xpReward: 50,
    condition: { type: 'action_count', action: 'complete_workout', value: 1 },
  },
  {
    key: 'workout_10',
    nameEs: 'Constancia',
    nameEn: 'Consistency',
    descEs: 'Completa 10 entrenamientos',
    descEn: 'Complete 10 workouts',
    icon: 'Target',
    xpReward: 200,
    condition: { type: 'action_count', action: 'complete_workout', value: 10 },
  },
  {
    key: 'workout_50',
    nameEs: 'Máquina de Entrenar',
    nameEn: 'Workout Machine',
    descEs: 'Completa 50 entrenamientos',
    descEn: 'Complete 50 workouts',
    icon: 'Flame',
    xpReward: 500,
    condition: { type: 'action_count', action: 'complete_workout', value: 50 },
  },
  {
    key: 'first_meal_log',
    nameEs: 'Control Nutricional',
    nameEn: 'Nutrition Control',
    descEs: 'Registra tu primera comida',
    descEn: 'Log your first meal',
    icon: 'Apple',
    xpReward: 25,
    condition: { type: 'action_count', action: 'log_meal', value: 1 },
  },
  {
    key: 'meal_log_30',
    nameEs: 'Dieta Consciente',
    nameEn: 'Conscious Diet',
    descEs: 'Registra 30 comidas',
    descEn: 'Log 30 meals',
    icon: 'Salad',
    xpReward: 300,
    condition: { type: 'action_count', action: 'log_meal', value: 30 },
  },
  {
    key: 'streak_3',
    nameEs: 'Tres en Racha',
    nameEn: 'Three Day Streak',
    descEs: 'Mantén una racha de 3 días',
    descEn: 'Maintain a 3-day streak',
    icon: 'Zap',
    xpReward: 75,
    condition: { type: 'streak', value: 3 },
  },
  {
    key: 'streak_7',
    nameEs: 'Semana Perfecta',
    nameEn: 'Perfect Week',
    descEs: 'Mantén una racha de 7 días',
    descEn: 'Maintain a 7-day streak',
    icon: 'Award',
    xpReward: 200,
    condition: { type: 'streak', value: 7 },
  },
  {
    key: 'streak_30',
    nameEs: 'Mes Imparable',
    nameEn: 'Unstoppable Month',
    descEs: 'Mantén una racha de 30 días',
    descEn: 'Maintain a 30-day streak',
    icon: 'Trophy',
    xpReward: 1000,
    condition: { type: 'streak', value: 30 },
  },
  {
    key: 'level_5',
    nameEs: 'Nivel 5',
    nameEn: 'Level 5',
    descEs: 'Alcanza el nivel 5',
    descEn: 'Reach level 5',
    icon: 'Star',
    xpReward: 150,
    condition: { type: 'level', value: 5 },
  },
  {
    key: 'level_10',
    nameEs: 'Doble Dígito',
    nameEn: 'Double Digits',
    descEs: 'Alcanza el nivel 10',
    descEn: 'Reach level 10',
    icon: 'Crown',
    xpReward: 500,
    condition: { type: 'level', value: 10 },
  },
  {
    key: 'xp_1000',
    nameEs: 'Primer Millar',
    nameEn: 'First Thousand',
    descEs: 'Acumula 1,000 XP',
    descEn: 'Accumulate 1,000 XP',
    icon: 'TrendingUp',
    xpReward: 100,
    condition: { type: 'total_xp', value: 1000 },
  },
  {
    key: 'personal_record',
    nameEs: 'Récord Personal',
    nameEn: 'Personal Record',
    descEs: 'Logra tu primer récord personal',
    descEn: 'Achieve your first personal record',
    icon: 'Medal',
    xpReward: 150,
    condition: { type: 'action_count', action: 'personal_record', value: 1 },
  },
];

async function seedAchievements() {
  console.log('Seeding achievements...');

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`Seeded ${achievements.length} achievements`);
}

seedAchievements()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
