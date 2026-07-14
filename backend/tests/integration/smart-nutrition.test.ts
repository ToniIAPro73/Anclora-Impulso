import request from 'supertest';
import app from '../../src/app';
import { env } from '../../src/config/env';

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

describe('smart nutrition', () => {
  const originalHealthImportEnabled = env.healthDataImportEnabled;

  afterEach(() => {
    env.healthDataImportEnabled = originalHealthImportEnabled;
  });

  it('creates foods, targets, and meal logs with calculated macros', async () => {
    const { accessToken } = await registerUser('smart-nutrition');

    const foodResponse = await request(app)
      .post('/api/nutrition/foods')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Greek Yogurt',
        brand: 'Fixture Dairy',
        servingSizeG: 100,
        calories: 59,
        protein: 10,
        carbs: 3.6,
        fat: 0.4,
        fiber: 0,
      });
    expect(foodResponse.status).toBe(201);

    const searchResponse = await request(app)
      .get('/api/nutrition/foods?query=greek')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.items[0]).toMatchObject({
      id: foodResponse.body.id,
      name: 'Greek Yogurt',
    });

    const targetResponse = await request(app)
      .put('/api/nutrition/targets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        calories: 2400,
        protein: 180,
        carbs: 250,
        fat: 70,
        fiber: 30,
        goal: 'build_muscle',
      });
    expect(targetResponse.status).toBe(200);
    expect(targetResponse.body).toMatchObject({
      calories: 2400,
      protein: 180,
      goal: 'build_muscle',
    });

    const mealLogResponse = await request(app)
      .post('/api/nutrition/meal-logs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        mealType: 'desayuno',
        foodItemId: foodResponse.body.id,
        quantityG: 150,
      });
    expect(mealLogResponse.status).toBe(201);
    expect(mealLogResponse.body).toMatchObject({
      name: 'Greek Yogurt',
      calories: 88.5,
      protein: 15,
      carbs: 5.4,
      fat: 0.6,
    });

    const logsResponse = await request(app)
      .get('/api/nutrition/meal-logs')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logsResponse.status).toBe(200);
    expect(logsResponse.body.items).toHaveLength(1);
  });

  it('creates a target-aware smart meal plan and exposes disabled health import status by default', async () => {
    env.healthDataImportEnabled = false;
    const { accessToken } = await registerUser('smart-plan');

    await request(app)
      .put('/api/nutrition/targets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        calories: 2100,
        protein: 150,
        carbs: 220,
        fat: 65,
        fiber: 28,
        goal: 'recomposition',
      })
      .expect(200);

    const planResponse = await request(app)
      .post('/api/nutrition/meal-plans/smart')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    expect(planResponse.status).toBe(201);
    expect(planResponse.body).toMatchObject({
      goal: 'recomposition',
      targetCalories: 2100,
      targetProtein: 150,
    });

    const importStatusResponse = await request(app)
      .get('/api/nutrition/health-import/status')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(importStatusResponse.status).toBe(200);
    expect(importStatusResponse.body).toMatchObject({
      enabled: false,
      providers: [
        { provider: 'google_fit', available: false },
        { provider: 'health_connect', available: false },
      ],
    });
  });
});
