import request from 'supertest';
import app from '../../src/app';
import { env } from '../../src/config/env';
import { prisma } from '../../src/config/database';

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function registerUser(prefix: string) {
  const response = await request(app).post('/api/auth/register').send({
    email: uniqueEmail(prefix),
    password: `credential-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    fullName: `${prefix} User`,
  });

  expect(response.status).toBe(201);

  return {
    accessToken: response.body.accessToken as string,
    userId: response.body.user.id as string,
  };
}

describe('wearables readiness', () => {
  const originalWearableSyncEnabled = env.wearableSyncEnabled;
  const originalWearableReadinessEnabled = env.wearableReadinessEnabled;

  afterEach(() => {
    env.wearableSyncEnabled = originalWearableSyncEnabled;
    env.wearableReadinessEnabled = originalWearableReadinessEnabled;
  });

  it('exposes a disabled-by-default wearable integration status', async () => {
    env.wearableSyncEnabled = false;
    env.wearableReadinessEnabled = false;
    const { accessToken } = await registerUser('wearable-status');

    const response = await request(app)
      .get('/api/wearables/status')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      enabled: false,
      readinessEnabled: false,
      tractionGate: 'blocked_until_d30_retention_validated',
      mobileStrategy: 'native_or_react_native_client_reusing_existing_api',
    });
    expect(response.body.providers).toEqual([
      { provider: 'healthkit', available: false, supportsBidirectionalSync: true },
      { provider: 'health_connect', available: false, supportsBidirectionalSync: true },
      { provider: 'garmin', available: false, supportsBidirectionalSync: false },
      { provider: 'whoop', available: false, supportsBidirectionalSync: false },
      { provider: 'oura', available: false, supportsBidirectionalSync: false },
    ]);
  });

  it('stores a provider connection and computes readiness from recovery samples when enabled', async () => {
    env.wearableSyncEnabled = true;
    env.wearableReadinessEnabled = true;
    const { accessToken } = await registerUser('wearable-sync');

    const connectionResponse = await request(app)
      .put('/api/wearables/connections/health_connect')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'connected',
        syncDirection: 'bidirectional',
        scopes: ['heart_rate', 'sleep', 'activity', 'hrv'],
      });

    expect(connectionResponse.status).toBe(200);
    expect(connectionResponse.body).toMatchObject({
      provider: 'health_connect',
      status: 'connected',
      syncDirection: 'bidirectional',
      scopes: ['heart_rate', 'sleep', 'activity', 'hrv'],
    });

    const sampleResponse = await request(app)
      .post('/api/wearables/recovery-samples')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        provider: 'health_connect',
        recordedAt: '2026-07-14T06:00:00.000Z',
        hrvMs: 28,
        restingHeartRateBpm: 72,
        sleepMinutes: 300,
        activityMinutes: 100,
      });

    expect(sampleResponse.status).toBe(201);
    expect(sampleResponse.body).toMatchObject({
      provider: 'health_connect',
      readinessScore: expect.any(Number),
    });
    expect(sampleResponse.body.readinessScore).toBeLessThan(50);

    const readinessResponse = await request(app)
      .get('/api/wearables/readiness')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(readinessResponse.status).toBe(200);
    expect(readinessResponse.body.latest).toMatchObject({
      provider: 'health_connect',
      readinessScore: sampleResponse.body.readinessScore,
    });
  });

  it('feeds low wearable readiness into progression recovery actions', async () => {
    env.wearableSyncEnabled = true;
    env.wearableReadinessEnabled = true;
    const { accessToken, userId } = await registerUser('wearable-progression');

    const exercise = await prisma.exercise.create({
      data: {
        name: `Wearable Squat ${Date.now()}`,
        category: 'strength',
        muscleGroup: 'legs',
        equipment: 'barbell',
        trainingEnvironments: ['gym'],
        difficulty: 'intermediate',
        description: 'Fixture squat',
        instructions: ['Brace', 'Squat'],
      },
    });

    await prisma.exerciseProgressionState.create({
      data: {
        userId,
        exerciseId: exercise.id,
        currentWeight: 100,
        targetMinReps: 8,
        targetMaxReps: 12,
        lastSessionReps: [8, 8, 8],
        lastSessionRIR: 2,
        consecutiveSuccesses: 0,
        consecutiveStalls: 0,
        lastTrainedAt: new Date('2026-07-07T10:00:00.000Z'),
        strategy: 'LINEAR',
      },
    });

    await request(app)
      .post('/api/wearables/recovery-samples')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        provider: 'healthkit',
        recordedAt: '2026-07-14T06:00:00.000Z',
        hrvMs: 24,
        restingHeartRateBpm: 78,
        sleepMinutes: 260,
        activityMinutes: 120,
      })
      .expect(201);

    const response = await request(app)
      .post('/api/v1/progression/next-session')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        now: '2026-07-14T10:00:00.000Z',
        plannedExercises: [
          {
            exerciseId: exercise.id,
            sets: 3,
            exercisePattern: 'lower_compound',
            primaryMuscle: 'legs',
            lastVolume: 1000,
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.prescriptions[0]).toMatchObject({
      exerciseId: exercise.id,
      recoveryAction: 'substitute_or_reduce',
      readinessScore: expect.any(Number),
    });
    expect(response.body.prescriptions[0].readinessScore).toBeLessThan(50);
    expect(response.body.prescriptions[0].reasons).toContain(
      'Wearable readiness is low; reduce intensity or substitute the exercise.'
    );
  });
});
