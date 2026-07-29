import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import crmRoutes from '../../routes/crm.js';
import ContactMessage from '../../models/ContactMessage.js';
import { createTestUser, generateToken } from '../setup.js';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/crm', crmRoutes);
  return app;
};

describe('CRM Messages', () => {
  describe('GET /api/crm/messages', () => {
    it('returns messages when authenticated', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);
      await ContactMessage.create({
        name: 'John',
        email: 'john@test.com',
        subject: 'Hello',
        message: 'Test message',
      });

      const app = createApp();
      const res = await request(app)
        .get('/api/crm/messages')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].subject).toBe('Hello');
    });

    it('rejects without authentication', async () => {
      const app = createApp();
      const res = await request(app).get('/api/crm/messages');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/crm/messages/:id', () => {
    it('returns a single message', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);
      const message = await ContactMessage.create({
        name: 'John',
        email: 'john@test.com',
        subject: 'Hello',
        message: 'Test message',
      });

      const app = createApp();
      const res = await request(app)
        .get(`/api/crm/messages/${message._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.subject).toBe('Hello');
    });

    it('returns 404 for non-existent message', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);
      const app = createApp();
      const res = await request(app)
        .get('/api/crm/messages/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/crm/messages/:id/read', () => {
    it('marks message as read', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);
      const message = await ContactMessage.create({
        name: 'John',
        email: 'john@test.com',
        subject: 'Hello',
        message: 'Test',
      });

      const app = createApp();
      const res = await request(app)
        .put(`/api/crm/messages/${message._id}/read`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.read).toBe(true);
    });
  });

  describe('GET /api/crm/stats', () => {
    it('returns message stats', async () => {
      const user = await createTestUser();
      const token = generateToken(user._id);

      await ContactMessage.create({ name: 'A', email: 'a@t.com', subject: 'S1', message: 'M1' });
      await ContactMessage.create({ name: 'B', email: 'b@t.com', subject: 'S2', message: 'M2' });

      const app = createApp();
      const res = await request(app)
        .get('/api/crm/messages/stats')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.unread).toBe(2);
    });
  });
});
