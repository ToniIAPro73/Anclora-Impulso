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

describe('premium form analysis and voice coaching', () => {
  const originalFormAnalysisEnabled = env.formAnalysisEnabled;
  const originalVoiceCoachEnabled = env.voiceCoachEnabled;

  afterEach(() => {
    env.formAnalysisEnabled = originalFormAnalysisEnabled;
    env.voiceCoachEnabled = originalVoiceCoachEnabled;
  });

  it('exposes disabled-by-default premium feature status', async () => {
    env.formAnalysisEnabled = false;
    env.voiceCoachEnabled = false;
    const { accessToken } = await registerUser('premium-status');

    const response = await request(app)
      .get('/api/premium/status')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      subscriptionTier: 'free',
      premiumEntitled: false,
      features: {
        formAnalysis: { enabled: false, available: false },
        voiceCoach: { enabled: false, available: false },
      },
    });
  });

  it('blocks free users even when premium feature flags are enabled', async () => {
    env.formAnalysisEnabled = true;
    env.voiceCoachEnabled = true;
    const { accessToken } = await registerUser('premium-free');

    await request(app)
      .post('/api/premium/form-analysis')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        exerciseName: 'Back Squat',
        mediaType: 'video',
        mediaUrl: 'https://example.com/squat.mp4',
      })
      .expect(403);

    await request(app)
      .post('/api/premium/voice-cues')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        workoutSessionId: 'session-local',
        exerciseName: 'Back Squat',
        phase: 'working_set',
        intensity: 'moderate',
      })
      .expect(403);
  });

  it('creates a queued form analysis request for premium users', async () => {
    env.formAnalysisEnabled = true;
    const { accessToken, userId } = await registerUser('premium-form');

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: 'premium' },
    });

    const response = await request(app)
      .post('/api/premium/form-analysis')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        exerciseName: 'Deadlift',
        mediaType: 'video',
        mediaUrl: 'https://example.com/deadlift.mp4',
        clientAnalysis: {
          repCount: 3,
          signals: ['hips_rising_early', 'bar_path_forward'],
        },
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      userId,
      exerciseName: 'Deadlift',
      mediaType: 'video',
      status: 'queued',
      disclaimer: expect.stringContaining('informational'),
    });
    expect(response.body.feedback).toEqual(expect.arrayContaining([
      'Keep the bar close and brace before each rep.',
      'Slow the first pull and keep hips and chest rising together.',
      'Aim for a more vertical bar path over mid-foot.',
      'Review the clip with a qualified coach before changing technique under heavy load.',
    ]));
  });

  it('generates deterministic voice cues for premium users', async () => {
    env.voiceCoachEnabled = true;
    const { accessToken, userId } = await registerUser('premium-voice');

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: 'pro' },
    });

    const response = await request(app)
      .post('/api/premium/voice-cues')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        workoutSessionId: 'session-local',
        exerciseName: 'Bench Press',
        phase: 'working_set',
        intensity: 'hard',
        locale: 'en-US',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      userId,
      exerciseName: 'Bench Press',
      phase: 'working_set',
      provider: 'deterministic',
      audioStatus: 'script_only',
      cues: [
        'Brace, set your shoulders, and control the first rep.',
        'Hard set: keep one rep in reserve and stop if form breaks.',
        'Breathe, finish clean, then rack with control.',
      ],
      disclaimer: expect.stringContaining('not medical advice'),
    });
  });
});
