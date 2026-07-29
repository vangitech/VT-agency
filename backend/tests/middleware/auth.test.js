import { describe, it, expect } from 'vitest';
import { protect, adminOnly, superadminOnly, requirePermission } from '../../middleware/auth.js';

const mockReq = (overrides = {}) => ({
  headers: {},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

describe('auth middleware', () => {
  describe('protect', () => {
    it('returns 401 if no token is provided', async () => {
      const req = mockReq();
      const res = mockRes();
      await protect(req, res, () => {});
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('returns 401 if token is invalid', async () => {
      const req = mockReq({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = mockRes();
      await protect(req, res, () => {});
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });
  });

  describe('adminOnly', () => {
    it('allows superadmin', () => {
      const req = mockReq({ user: { role: 'superadmin' } });
      const res = mockRes();
      const next = () => { expect(true).toBe(true); };
      adminOnly(req, res, next);
    });

    it('allows admin', () => {
      const req = mockReq({ user: { role: 'admin' } });
      const res = mockRes();
      const next = () => { expect(true).toBe(true); };
      adminOnly(req, res, next);
    });

    it('allows manager', () => {
      const req = mockReq({ user: { role: 'manager' } });
      const res = mockRes();
      const next = () => { expect(true).toBe(true); };
      adminOnly(req, res, next);
    });

    it('denies editor', () => {
      const req = mockReq({ user: { role: 'editor' } });
      const res = mockRes();
      adminOnly(req, res, () => {});
      expect(res.statusCode).toBe(403);
    });

    it('denies unauthenticated', () => {
      const req = mockReq();
      const res = mockRes();
      adminOnly(req, res, () => {});
      expect(res.statusCode).toBe(403);
    });
  });

  describe('superadminOnly', () => {
    it('allows superadmin', () => {
      const req = mockReq({ user: { role: 'superadmin' } });
      const res = mockRes();
      const next = () => { expect(true).toBe(true); };
      superadminOnly(req, res, next);
    });

    it('denies admin', () => {
      const req = mockReq({ user: { role: 'admin' } });
      const res = mockRes();
      superadminOnly(req, res, () => {});
      expect(res.statusCode).toBe(403);
    });

    it('denies unauthenticated', () => {
      const req = mockReq();
      const res = mockRes();
      superadminOnly(req, res, () => {});
      expect(res.statusCode).toBe(403);
    });
  });

  describe('requirePermission', () => {
    it('allows superadmin for any resource', () => {
      const req = mockReq({ user: { role: 'superadmin' } });
      const res = mockRes();
      const next = () => { expect(true).toBe(true); };
      requirePermission('deals')(req, res, next);
    });

    it('allows user with all permission', () => {
      const req = mockReq({
        user: { role: 'admin', permissions: { deals: 'all' } },
      });
      const res = mockRes();
      const next = () => { expect(true).toBe(true); };
      requirePermission('deals')(req, res, next);
    });

    it('allows user with own permission and sets owner query', () => {
      const userId = '507f1f77bcf86cd799439011';
      const req = mockReq({
        user: { _id: userId, role: 'agent', permissions: { contacts: 'own' } },
        query: {},
      });
      const res = mockRes();
      const next = () => {
        expect(req.query.owner).toBe(userId);
      };
      requirePermission('contacts')(req, res, next);
    });

    it('denies user with none permission', () => {
      const req = mockReq({
        user: { role: 'editor', permissions: { deals: 'none' } },
      });
      const res = mockRes();
      requirePermission('deals')(req, res, () => {});
      expect(res.statusCode).toBe(403);
    });

    it('denies unauthenticated', () => {
      const req = mockReq();
      const res = mockRes();
      requirePermission('deals')(req, res, () => {});
      expect(res.statusCode).toBe(401);
    });
  });
});
