import request from 'supertest';
import app from '../../src/app';

describe('health routes', () => {
  it('responds to the liveness probe', async () => {
    const response = await request(app).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ alive: true });
  });
});
