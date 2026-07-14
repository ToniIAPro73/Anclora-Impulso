import request from 'supertest';
import app from '../../src/app';
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

async function createWorkoutFixture(userId: string) {
  const exercise = await prisma.exercise.create({
    data: {
      name: `Social Exercise ${Date.now()}-${Math.random().toString(36).slice(2)}`,
      category: 'strength',
      muscleGroup: 'legs',
      equipment: 'barbell',
      trainingEnvironments: ['gym'],
      difficulty: 'beginner',
      description: 'Social fixture exercise',
      instructions: ['Move with control'],
    },
  });

  const workout = await prisma.workout.create({
    data: {
      userId,
      name: 'Social workout',
      exercises: {
        create: [
          {
            exerciseId: exercise.id,
            sets: 1,
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

async function completeWorkout(accessToken: string, workoutId: string, exerciseId: string) {
  return request(app)
    .post('/api/sessions')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      workoutId,
      duration: 900,
      exercises: [
        {
          exerciseId,
          sets: [{ reps: 8, weight: 40, order: 0 }],
        },
      ],
    });
}

describe('social community', () => {
  beforeEach(async () => {
    await prisma.kudos.deleteMany();
    await prisma.activityFeedItem.deleteMany();
    await prisma.challengeParticipant.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.follow.deleteMany();
  });

  it('creates a real workout feed item, supports follows, privacy, and kudos', async () => {
    const athlete = await registerUser('social-athlete');
    const viewer = await registerUser('social-viewer');
    const outsider = await registerUser('social-outsider');

    await request(app)
      .put('/api/social/privacy')
      .set('Authorization', `Bearer ${athlete.accessToken}`)
      .send({ visibility: 'private' })
      .expect(200);

    const { exercise, workout } = await createWorkoutFixture(athlete.userId);
    const sessionResponse = await completeWorkout(athlete.accessToken, workout.id, exercise.id);
    expect(sessionResponse.status).toBe(201);

    const outsiderFeed = await request(app)
      .get('/api/social/feed')
      .set('Authorization', `Bearer ${outsider.accessToken}`);
    expect(outsiderFeed.status).toBe(200);
    expect(outsiderFeed.body.items).toHaveLength(0);

    await request(app)
      .post(`/api/social/follows/${athlete.userId}`)
      .set('Authorization', `Bearer ${viewer.accessToken}`)
      .expect(201);

    const viewerFeed = await request(app)
      .get('/api/social/feed')
      .set('Authorization', `Bearer ${viewer.accessToken}`);
    expect(viewerFeed.status).toBe(200);
    expect(viewerFeed.body.items).toHaveLength(1);
    expect(viewerFeed.body.items[0]).toMatchObject({
      userId: athlete.userId,
      type: 'workout_completed',
      kudosCount: 0,
      hasKudosFromMe: false,
    });

    const feedItemId = viewerFeed.body.items[0].id as string;
    const kudosResponse = await request(app)
      .post(`/api/social/feed/${feedItemId}/kudos`)
      .set('Authorization', `Bearer ${viewer.accessToken}`);
    expect(kudosResponse.status).toBe(201);

    const updatedFeed = await request(app)
      .get('/api/social/feed')
      .set('Authorization', `Bearer ${viewer.accessToken}`);
    expect(updatedFeed.body.items[0]).toMatchObject({
      kudosCount: 1,
      hasKudosFromMe: true,
    });
  }, 20000);

  it('creates a weekly challenge and ranks joined users after workout completion', async () => {
    const athlete = await registerUser('challenge-athlete');

    const weeklyResponse = await request(app)
      .get('/api/social/challenges/weekly')
      .set('Authorization', `Bearer ${athlete.accessToken}`);
    expect(weeklyResponse.status).toBe(200);
    expect(weeklyResponse.body.metric).toBe('workout_completions');

    await request(app)
      .post(`/api/social/challenges/${weeklyResponse.body.id}/join`)
      .set('Authorization', `Bearer ${athlete.accessToken}`)
      .expect(201);

    const { exercise, workout } = await createWorkoutFixture(athlete.userId);
    const sessionResponse = await completeWorkout(athlete.accessToken, workout.id, exercise.id);
    expect(sessionResponse.status).toBe(201);

    const leaderboard = await request(app)
      .get(`/api/social/challenges/${weeklyResponse.body.id}/leaderboard`)
      .set('Authorization', `Bearer ${athlete.accessToken}`);
    expect(leaderboard.status).toBe(200);
    expect(leaderboard.body.entries[0]).toMatchObject({
      userId: athlete.userId,
      score: 1,
      rank: 1,
    });
  }, 20000);
});
