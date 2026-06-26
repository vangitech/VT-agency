import express from 'express';
import { protect } from '../middleware/auth.js';
import * as securityController from '../controllers/securityController.js';

const router = express.Router();
router.use(protect);

router.get('/audit-logs', securityController.getAuditLogs);
router.post('/2fa/generate', securityController.generate2FASecret);
router.post('/2fa/verify', securityController.verify2FA);
router.post('/2fa/verify-login', securityController.verify2FALogin);
router.post('/2fa/disable', securityController.disable2FA);
router.put('/permissions', securityController.updatePermissions);

export default router;
