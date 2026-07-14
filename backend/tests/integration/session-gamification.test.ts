import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function createWorkoutFixture(userId: string) {
  const exercise = await prisma.exercise.create({
    data: {
      name: `Session Gamification Exercise ${Date.now()}`,
      category: 'strength',
      muscleGroup: 'legs',
      equipment: 'barbell',
      trainingEnvironments: ['gym'],
      difficulty: 'beginner',
      description: 'Fixture exercise',
      instructions: ['Lift with control'],
    },
  });

  const workout = await prisma.workout.create({
    data: {
      userId,
      name: 'First gamified workout',
      exercises: {
        create: [
          {
            exerciseId: exercise.id,
            sets: 3,
            reps: 8,
            rest: 90,
            order: 0,
          },
        ],
      },
    },
  });

  return { exercise, workout };
}

describe('session gamification', () => {
  it('awards XP, updates streaks, and unlocks first workout achievement when a session is completed', async () => {
    await prisma.achievement.upsert({
      where: { key: 'first_workout' },
      update: {
        condition: { type: 'action_count', action: 'complete_workout', value: 1 },
      },
      create: {
        key: 'first_workout',
        nameEs: 'Primer Paso',
        nameEn: 'First Step',
        descEs: 'Completa tu primer entrenamiento',
        descEn: 'Complete your first workout',
        icon: 'Dumbbell',
        xpReward: 50,
        condition: { type: 'action_count', action: 'complete_workout', value: 1 },
      },
    });

    const registerResponse = await request(app).post('/api/auth/register').send({
      email: uniqueEmail('session-gamification'),
      password: 'password123',
      fullName: 'Session Gamification User',
    });

    expect(registerResponse.status).toBe(201);

    const accessToken = registerResponse.body.accessToken as string;
    const userId = registerResponse.body.user.id as string;
    const { exercise, workout } = await createWorkoutFixture(userId);

    const sessionResponse = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        workoutId: workout.id,
        duration: 1800,
        notes: 'Completed first workout',
        exercises: [
          {
            exerciseId: exercise.id,
            sets: [
              { reps: 8, weight: 40, order: 0 },
              { reps: 8, weight: 40, order: 1 },
              { reps: 8, weight: 40, order: 2 },
            ],
          },
        ],
      });

    expect(sessionResponse.status).toBe(201);

    const statusResponse = await request(app)
      .get('/api/gamification/status')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body).toMatchObject({
      currentStreak: 1,
      longestStreak: 1,
      xp: 100,
    });

    const achievementsResponse = await request(app)
      .get('/api/gamification/achievements')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(achievementsResponse.status).toBe(200);
    expect(achievementsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'first_workout',
          unlocked: true,
        }),
      ])
    );
  });
});
