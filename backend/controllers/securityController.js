import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import speakeasy from 'speakeasy';

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource, userId } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logEvent = async ({ user, action, resource, resourceId, details, ipAddress, userAgent, severity = 'info' }) => {
  try {
    await AuditLog.create({ user, action, resource, resourceId, details, ipAddress, userAgent, severity });
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
};

export const generate2FASecret = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `Vangitech:${req.user.email}` });
    req.user.twoFactorSecret = secret.base32;
    await req.user.save();
    res.json({ secret: secret.base32, otpauth_url: secret.otpauth_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) return res.status(400).json({ message: 'Invalid code' });

    req.user.twoFactorEnabled = true;
    req.user.twoFactorVerified = true;
    await req.user.save();

    await logEvent({
      user: req.user._id, action: '2fa_enabled', resource: 'user',
      resourceId: req.user._id, details: { method: 'totp' },
      ipAddress: req.ip, userAgent: req.headers['user-agent'], severity: 'warning',
    });

    res.json({ message: '2FA enabled successfully', twoFactorEnabled: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verify2FALogin = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.twoFactorEnabled) return res.status(400).json({ message: '2FA not enabled' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) return res.status(400).json({ message: 'Invalid code' });
    res.json({ verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      const verified = speakeasy.totp.verify({
        secret: req.user.twoFactorSecret,
        encoding: 'base32',
        token,
      });
      if (!verified) return res.status(400).json({ message: 'Invalid code' });
    }
    req.user.twoFactorEnabled = false;
    req.user.twoFactorSecret = '';
    req.user.twoFactorVerified = false;
    await req.user.save();

    await logEvent({
      user: req.user._id, action: '2fa_disabled', resource: 'user',
      resourceId: req.user._id, details: {}, ipAddress: req.ip,
      userAgent: req.headers['user-agent'], severity: 'warning',
    });

    res.json({ message: '2FA disabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePermissions = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Only superadmin can change permissions' });
    const user = await User.findByIdAndUpdate(userId, { permissions }, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    await logEvent({
      user: req.user._id, action: 'permissions_updated', resource: 'user',
      resourceId: userId, details: { permissions },
      ipAddress: req.ip, userAgent: req.headers['user-agent'], severity: 'info',
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
