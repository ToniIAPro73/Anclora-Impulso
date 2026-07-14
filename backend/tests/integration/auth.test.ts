import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

describe('auth routes', () => {
  it('stores password hashes and never returns the password hash', async () => {
    const email = uniqueEmail('auth-register');
    const password = 'password123';

    const response = await request(app).post('/api/auth/register').send({
      email,
      password,
      fullName: 'Auth Test User',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      user: {
        email,
        fullName: 'Auth Test User',
        isAdmin: false,
      },
    });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    expect(user.passwordHash).not.toBe(password);
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('rejects invalid login credentials', async () => {
    const email = uniqueEmail('auth-login-fail');

    await request(app).post('/api/auth/register').send({
      email,
      password: 'password123',
      fullName: 'Auth Test User',
    });

    const response = await request(app).post('/api/auth/login').send({
      email,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('incorrectos');
  });

  it('refreshes access tokens with a valid refresh token', async () => {
    const email = uniqueEmail('auth-refresh');

    const registerResponse = await request(app).post('/api/auth/register').send({
      email,
      password: 'password123',
      fullName: 'Refresh Test User',
    });

    const response = await request(app).post('/api/auth/refresh').send({
      refreshToken: registerResponse.body.refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('protects the current-user endpoint', async () => {
    const anonymousResponse = await request(app).get('/api/auth/me');

    expect(anonymousResponse.status).toBe(401);

    const email = uniqueEmail('auth-me');
    const registerResponse = await request(app).post('/api/auth/register').send({
      email,
      password: 'password123',
      fullName: 'Me Test User',
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      email,
      fullName: 'Me Test User',
      isAdmin: false,
    });
  });

  it('rate limits repeated failed login attempts', async () => {
    const email = uniqueEmail('auth-rate-limit');
    const forwardedFor = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', forwardedFor)
        .send({
          email,
          password: 'wrong-password',
        });

      expect(response.status).toBe(401);
    }

    const limitedResponse = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', forwardedFor)
      .send({
        email,
        password: 'wrong-password',
      });

    expect(limitedResponse.status).toBe(429);
  });
});
