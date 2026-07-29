import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import authRoutes from '../../routes/auth.js';
import User from '../../models/User.js';
import { createTestUser, generateToken } from '../setup.js';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    await createTestUser({ email: 'test@test.com', password: 'Password1!' });
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'Password1!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe('test@test.com');
  });

  it('rejects invalid password', async () => {
    await createTestUser({ email: 'test@test.com', password: 'Password1!' });
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noone@test.com', password: 'Password1!' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user profile with valid token', async () => {
    const user = await createTestUser();
    const token = generateToken(user._id);
    const app = createApp();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@test.com');
  });

  it('rejects request without token', async () => {
    const app = createApp();
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('always returns success regardless of whether email exists', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('reset link');
  });

  it('sets reset token for existing user', async () => {
    await createTestUser({ email: 'existing@test.com' });
    const app = createApp();
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'existing@test.com' });
    const user = await User.findOne({ email: 'existing@test.com' });
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpire).toBeDefined();
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  it('resets password with valid token', async () => {
    const user = await createTestUser();
    user.resetPasswordToken = 'valid-reset-token';
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    const app = createApp();
    const res = await request(app)
      .post('/api/auth/reset-password/valid-reset-token')
      .send({ password: 'NewPass123!' });
    expect(res.status).toBe(200);

    const updated = await User.findById(user._id);
    const match = await bcrypt.compare('NewPass123!', updated.password);
    expect(match).toBe(true);
    expect(updated.resetPasswordToken).toBeUndefined();
  });

  it('rejects expired token', async () => {
    const user = await createTestUser();
    user.resetPasswordToken = 'expired-token';
    user.resetPasswordExpire = Date.now() - 1000;
    await user.save();

    const app = createApp();
    const res = await request(app)
      .post('/api/auth/reset-password/expired-token')
      .send({ password: 'NewPass123!' });
    expect(res.status).toBe(400);
  });
});
