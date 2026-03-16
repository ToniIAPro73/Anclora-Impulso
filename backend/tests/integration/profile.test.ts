import request from 'supertest';
import app from '../../src/app';

describe('profile routes', () => {
  it('gets and updates the authenticated user profile', async () => {
    const email = `profile-${Date.now()}@example.com`;
    const password = 'password123';

    const registerResponse = await request(app).post('/api/auth/register').send({
      email,
      password,
      fullName: 'Profile Test User',
    });

    expect(registerResponse.status).toBe(201);

    const accessToken = registerResponse.body.accessToken as string;

    const getResponse = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      avatarDataUrl: null,
      sex: null,
      age: null,
      heightCm: null,
      weightKg: null,
      targetWeightKg: null,
      timeframeWeeks: null,
      trainingDaysPerWeek: null,
    });

    const updateResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sex: 'male',
        age: 41,
        heightCm: 178,
        weightKg: 84.5,
        targetWeightKg: 78,
        timeframeWeeks: 12,
        trainingDaysPerWeek: 4,
        avatarDataUrl: 'data:image/png;base64,abc',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      sex: 'male',
      age: 41,
      heightCm: 178,
      weightKg: 84.5,
      targetWeightKg: 78,
      timeframeWeeks: 12,
      trainingDaysPerWeek: 4,
      avatarDataUrl: 'data:image/png;base64,abc',
    });
  });
});
