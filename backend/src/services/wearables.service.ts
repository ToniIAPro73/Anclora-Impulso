import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import type { CreateRecoverySampleInput, UpsertWearableConnectionInput } from '../utils/validators';

export type WearableProvider = 'healthkit' | 'health_connect' | 'garmin' | 'whoop' | 'oura' | 'manual';

const providers: Array<{
  provider: Exclude<WearableProvider, 'manual'>;
  supportsBidirectionalSync: boolean;
}> = [
  { provider: 'healthkit', supportsBidirectionalSync: true },
  { provider: 'health_connect', supportsBidirectionalSync: true },
  { provider: 'garmin', supportsBidirectionalSync: false },
  { provider: 'whoop', supportsBidirectionalSync: false },
  { provider: 'oura', supportsBidirectionalSync: false },
];

const validProviders = new Set<WearableProvider>(['healthkit', 'health_connect', 'garmin', 'whoop', 'oura', 'manual']);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function assertProvider(provider: string): asserts provider is Exclude<WearableProvider, 'manual'> {
  if (!validProviders.has(provider as WearableProvider) || provider === 'manual') {
    throw new AppError(400, 'Invalid wearable provider');
  }
}

function assertSyncEnabled() {
  if (!env.wearableSyncEnabled) {
    throw new AppError(403, 'Wearable sync is disabled');
  }
}

export function getWearableStatus() {
  return {
    enabled: env.wearableSyncEnabled,
    readinessEnabled: env.wearableReadinessEnabled,
    tractionGate: 'blocked_until_d30_retention_validated',
    mobileStrategy: 'native_or_react_native_client_reusing_existing_api',
    providers: providers.map((provider) => ({
      ...provider,
      available: env.wearableSyncEnabled,
    })),
    pushNotifications: {
      available: env.wearableSyncEnabled,
      strategy: 'native_device_registration_contract_pending_client',
    },
  };
}

export async function upsertConnection(userId: string, provider: string, input: UpsertWearableConnectionInput) {
  assertSyncEnabled();
  assertProvider(provider);

  return prisma.wearableConnection.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    create: {
      userId,
      provider,
      status: input.status,
      syncDirection: input.syncDirection,
      scopes: input.scopes,
      lastSyncAt: input.status === 'connected' ? new Date() : null,
    },
    update: {
      status: input.status,
      syncDirection: input.syncDirection,
      scopes: input.scopes,
      lastSyncAt: input.status === 'connected' ? new Date() : null,
    },
  });
}

export function calculateReadinessScore(input: Pick<
  CreateRecoverySampleInput,
  'hrvMs' | 'restingHeartRateBpm' | 'sleepMinutes' | 'activityMinutes'
>) {
  const hrvScore = input.hrvMs === undefined ? 55 : clamp((input.hrvMs / 70) * 100, 0, 100);
  const restingHeartRateScore = input.restingHeartRateBpm === undefined
    ? 55
    : clamp(((85 - input.restingHeartRateBpm) / 35) * 100, 0, 100);
  const sleepScore = input.sleepMinutes === undefined ? 55 : clamp((input.sleepMinutes / 480) * 100, 0, 100);
  const activityScore = input.activityMinutes === undefined
    ? 55
    : clamp(100 - Math.max(0, input.activityMinutes - 45) * 1.2, 0, 100);

  return Math.round(
    hrvScore * 0.35 +
    restingHeartRateScore * 0.25 +
    sleepScore * 0.3 +
    activityScore * 0.1
  );
}

export async function createRecoverySample(userId: string, input: CreateRecoverySampleInput) {
  assertSyncEnabled();
  const readinessScore = calculateReadinessScore(input);

  return prisma.recoverySample.create({
    data: {
      userId,
      provider: input.provider,
      recordedAt: new Date(input.recordedAt),
      hrvMs: input.hrvMs,
      restingHeartRateBpm: input.restingHeartRateBpm,
      sleepMinutes: input.sleepMinutes,
      activityMinutes: input.activityMinutes,
      readinessScore,
      payload: input.payload as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getLatestReadiness(userId: string) {
  if (!env.wearableReadinessEnabled) {
    return {
      enabled: false,
      latest: null,
    };
  }

  const latest = await prisma.recoverySample.findFirst({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
  });

  return {
    enabled: true,
    latest,
  };
}
