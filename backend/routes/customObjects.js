import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as customObjectController from '../controllers/customObjectController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/object-types', customObjectController.getObjectTypes);
router.get('/object-types/:id', customObjectController.getObjectType);
router.post('/object-types', customObjectController.createObjectType);
router.put('/object-types/:id', customObjectController.updateObjectType);
router.delete('/object-types/:id', customObjectController.deleteObjectType);

router.get('/records', customObjectController.getRecords);
router.get('/records/:id', customObjectController.getRecord);
router.post('/records', customObjectController.createRecord);
router.put('/records/:id', customObjectController.updateRecord);
router.delete('/records/:id', customObjectController.deleteRecord);

export default router;
