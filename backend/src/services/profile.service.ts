import { prisma } from '../config/database';

export interface UserProfile {
  avatarDataUrl: string | null;
  sex: 'male' | 'female' | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  timeframeWeeks: number | null;
  trainingDaysPerWeek: number | null;
}

export interface UpdateUserProfileInput {
  avatarDataUrl?: string | null;
  sex?: 'male' | 'female' | null;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  targetWeightKg?: number | null;
  timeframeWeeks?: number | null;
  trainingDaysPerWeek?: number | null;
}

function mapUserToProfile(user: {
  avatarDataUrl: string | null;
  sex: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  timeframeWeeks: number | null;
  trainingDaysPerWeek: number | null;
}): UserProfile {
  return {
    avatarDataUrl: user.avatarDataUrl,
    sex: (user.sex as UserProfile['sex']) ?? null,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    targetWeightKg: user.targetWeightKg,
    timeframeWeeks: user.timeframeWeeks,
    trainingDaysPerWeek: user.trainingDaysPerWeek,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      avatarDataUrl: true,
      sex: true,
      age: true,
      heightCm: true,
      weightKg: true,
      targetWeightKg: true,
      timeframeWeeks: true,
      trainingDaysPerWeek: true,
    },
  });

  return mapUserToProfile(user);
}

export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarDataUrl: input.avatarDataUrl,
      sex: input.sex,
      age: input.age,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      targetWeightKg: input.targetWeightKg,
      timeframeWeeks: input.timeframeWeeks,
      trainingDaysPerWeek: input.trainingDaysPerWeek,
    },
    select: {
      avatarDataUrl: true,
      sex: true,
      age: true,
      heightCm: true,
      weightKg: true,
      targetWeightKg: true,
      timeframeWeeks: true,
      trainingDaysPerWeek: true,
    },
  });

  return mapUserToProfile(user);
}
