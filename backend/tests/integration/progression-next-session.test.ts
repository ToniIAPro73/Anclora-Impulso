import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

describe('progression next-session endpoint', () => {
  it('returns adaptive prescriptions and persists updated progression state', async () => {
    const authCredential = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const registerResponse = await request(app).post('/api/auth/register').send({
      email: uniqueEmail('progression'),
      password: authCredential,
      fullName: 'Progression User',
    });

    expect(registerResponse.status).toBe(201);

    const accessToken = registerResponse.body.accessToken as string;
    const userId = registerResponse.body.user.id as string;

    const exercise = await prisma.exercise.create({
      data: {
        name: `Progression Bench Press ${Date.now()}`,
        category: 'strength',
        muscleGroup: 'chest',
        equipment: 'barbell',
        trainingEnvironments: ['gym'],
        difficulty: 'intermediate',
        description: 'Fixture bench press',
        instructions: ['Lower under control', 'Press up'],
      },
    });

    await prisma.exerciseProgressionState.create({
      data: {
        userId,
        exerciseId: exercise.id,
        currentWeight: 80,
        targetMinReps: 8,
        targetMaxReps: 12,
        lastSessionReps: [12, 12, 12],
        lastSessionRIR: 2,
        consecutiveSuccesses: 0,
        consecutiveStalls: 0,
        lastTrainedAt: new Date('2026-07-13T10:00:00.000Z'),
        strategy: 'DUP',
      },
    });

    const response = await request(app)
      .post('/api/v1/progression/next-session')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        now: '2026-07-14T10:00:00.000Z',
        weekIndex: 1,
        sessionIndex: 0,
        plannedExercises: [
          {
            exerciseId: exercise.id,
            sets: 3,
            exercisePattern: 'upper_compound',
            primaryMuscle: 'chest',
            lastVolume: 4500,
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.prescriptions[0]).toMatchObject({
      exerciseId: exercise.id,
      weight: 82.5,
      repRange: { minReps: 3, maxReps: 5 },
      targetRIR: 1,
      focus: 'STRENGTH',
      freshnessScore: expect.any(Number),
      recoveryAction: 'substitute_or_reduce',
    });
    expect(response.body.prescriptions[0].freshnessScore).toBeLessThan(50);

    const updatedState = await prisma.exerciseProgressionState.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId: exercise.id,
        },
      },
    });

    expect(updatedState?.currentWeight).toBe(82.5);
    expect(updatedState?.consecutiveSuccesses).toBe(1);
  });
});
