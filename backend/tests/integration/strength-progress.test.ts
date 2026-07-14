import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

describe('strength progress tracking', () => {
  it('stores detailed set logs and exposes volume, muscle volume, PRs, and 1RM estimates', async () => {
    const authCredential = `credential-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const registerResponse = await request(app).post('/api/auth/register').send({
      email: uniqueEmail('strength-progress'),
      password: authCredential,
      fullName: 'Strength Progress User',
    });

    expect(registerResponse.status).toBe(201);

    const accessToken = registerResponse.body.accessToken as string;
    const userId = registerResponse.body.user.id as string;

    const exercise = await prisma.exercise.create({
      data: {
        name: `Bench Press ${Date.now()}`,
        category: 'strength',
        muscleGroup: 'chest',
        equipment: 'barbell',
        trainingEnvironments: ['gym'],
        difficulty: 'intermediate',
        description: 'Fixture bench press',
        instructions: ['Lower under control', 'Press up'],
      },
    });

    const workout = await prisma.workout.create({
      data: {
        userId,
        name: 'Strength tracking workout',
        exercises: {
          create: [
            {
              exerciseId: exercise.id,
              sets: 3,
              reps: 8,
              rest: 120,
              order: 0,
            },
          ],
        },
      },
    });

    const sessionResponse = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        workoutId: workout.id,
        duration: 2400,
        exercises: [
          {
            exerciseId: exercise.id,
            sets: [
              { reps: 8, weight: 60, rir: 2, rpe: 8, restSeconds: 120, order: 0 },
              { reps: 8, weight: 62.5, rir: 1, rpe: 9, restSeconds: 135, order: 1 },
              { reps: 6, weight: 65, rir: 0, rpe: 10, restSeconds: 150, order: 2 },
            ],
          },
        ],
      });

    expect(sessionResponse.status).toBe(201);
    expect(sessionResponse.body.exercises[0].sets[0]).toMatchObject({
      reps: 8,
      weight: 60,
      rir: 2,
      rpe: 8,
      restSeconds: 120,
    });

    const progressResponse = await request(app)
      .get('/api/progress/strength')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(progressResponse.status).toBe(200);
    expect(progressResponse.body.totalVolume).toBe(1370);
    expect(progressResponse.body.personalRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          maxWeight: 65,
          bestEstimatedOneRepMax: expect.any(Number),
        }),
      ])
    );
    expect(progressResponse.body.personalRecords[0].bestEstimatedOneRepMax).toBeGreaterThan(77);
    expect(progressResponse.body.muscleVolume).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          muscleGroup: 'chest',
          totalVolume: 1370,
        }),
      ])
    );
    expect(progressResponse.body.recentSets[0]).toMatchObject({
      exerciseName: exercise.name,
      muscleGroup: 'chest',
      reps: 6,
      weight: 65,
      rir: 0,
      rpe: 10,
      restSeconds: 150,
    });
  }, 15000);
});
