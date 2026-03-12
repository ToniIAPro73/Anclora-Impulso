import { prisma } from '../config/database';
import logger from '../config/logger';

// Constantes de XP
const XP_REWARDS = {
  complete_workout: 50,
  log_meal: 10,
  hit_daily_macros: 25,
  personal_record: 100,
  streak_bonus_multiplier: 1.5, // a partir de 7 días
} as const;

// Cálculo de nivel: level = floor(sqrt(xp / 100)) + 1
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// XP necesario para el siguiente nivel
function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

/**
 * Obtener o crear el estado de gamificación de un usuario
 */
export async function getOrCreateGamification(userId: string) {
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) {
    gamification = await prisma.userGamification.create({
      data: { userId },
    });
  }

  const currentLevelXP = xpForLevel(gamification.level);
  const nextLevelXP = xpForLevel(gamification.level + 1);

  return {
    ...gamification,
    xpProgress: gamification.xp - currentLevelXP,
    xpToNextLevel: nextLevelXP - currentLevelXP,
    progressPercent: Math.round(
      ((gamification.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    ),
  };
}

/**
 * Otorgar XP por una acción
 */
export async function awardXP(
  userId: string,
  action: string,
  baseXP?: number
): Promise<{
  xpAwarded: number;
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  newAchievements: string[];
}> {
  const gamification = await getOrCreateGamification(userId);
  let xp = baseXP || XP_REWARDS[action as keyof typeof XP_REWARDS] || 10;

  // Aplicar multiplicador de racha
  if (gamification.currentStreak >= 7) {
    xp = Math.round(xp * XP_REWARDS.streak_bonus_multiplier);
  }

  // Registrar evento XP
  await prisma.xPEvent.create({
    data: { userId, action, xp },
  });

  const newXP = gamification.xp + xp;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > gamification.level;

  // Actualizar gamificación
  await prisma.userGamification.update({
    where: { userId },
    data: {
      xp: newXP,
      level: newLevel,
      lastActivityAt: new Date(),
    },
  });

  // Verificar logros
  const newAchievements = await checkAchievements(userId, action, newXP, newLevel);

  logger.info('XP awarded', { userId, action, xp, newXP, newLevel, leveledUp });

  return {
    xpAwarded: xp,
    newXP,
    newLevel,
    leveledUp,
    newAchievements,
  };
}

/**
 * Actualizar racha del usuario
 */
export async function updateStreak(userId: string) {
  const gamification = await getOrCreateGamification(userId);
  const now = new Date();
  const lastActivity = gamification.lastActivityAt;

  let newStreak = 1;

  if (lastActivity) {
    const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (diffHours < 48) {
      // Dentro de la ventana: incrementar racha
      // Solo si pasó al menos un día
      const lastDate = new Date(lastActivity);
      lastDate.setHours(0, 0, 0, 0);
      const todayDate = new Date(now);
      todayDate.setHours(0, 0, 0, 0);

      if (todayDate.getTime() > lastDate.getTime()) {
        newStreak = gamification.currentStreak + 1;
      } else {
        newStreak = gamification.currentStreak; // Mismo día
      }
    }
    // Si > 48h, se resetea a 1
  }

  const longestStreak = Math.max(gamification.longestStreak, newStreak);

  await prisma.userGamification.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak,
      lastActivityAt: now,
    },
  });

  return { currentStreak: newStreak, longestStreak };
}

/**
 * Verificar y desbloquear logros
 */
async function checkAchievements(
  userId: string,
  action: string,
  totalXP: number,
  level: number
): Promise<string[]> {
  const unlockedKeys: string[] = [];

  const allAchievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    const condition = achievement.condition as {
      type: string;
      value: number;
      action?: string;
    };

    let unlocked = false;

    switch (condition.type) {
      case 'total_xp':
        unlocked = totalXP >= condition.value;
        break;
      case 'level':
        unlocked = level >= condition.value;
        break;
      case 'action_count': {
        const count = await prisma.xPEvent.count({
          where: { userId, action: condition.action || action },
        });
        unlocked = count >= condition.value;
        break;
      }
      case 'streak': {
        const gamification = await prisma.userGamification.findUnique({
          where: { userId },
        });
        unlocked = (gamification?.currentStreak || 0) >= condition.value;
        break;
      }
    }

    if (unlocked) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });

      // Otorgar XP de recompensa del logro
      if (achievement.xpReward > 0) {
        await prisma.xPEvent.create({
          data: {
            userId,
            action: `achievement_${achievement.key}`,
            xp: achievement.xpReward,
          },
        });
        await prisma.userGamification.update({
          where: { userId },
          data: { xp: { increment: achievement.xpReward } },
        });
      }

      unlockedKeys.push(achievement.key);
    }
  }

  return unlockedKeys;
}

/**
 * Obtener logros del usuario
 */
export async function getUserAchievements(userId: string) {
  const allAchievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  return allAchievements.map((a) => ({
    ...a,
    unlocked: earnedIds.has(a.id),
    unlockedAt: userAchievements.find((ua) => ua.achievementId === a.id)?.unlockedAt || null,
  }));
}

/**
 * Obtener historial de XP reciente
 */
export async function getXPHistory(userId: string, limit = 20) {
  return prisma.xPEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
