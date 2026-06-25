import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as calendarController from '../controllers/calendarController.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/events', calendarController.getEvents);
router.get('/events/upcoming', calendarController.getUpcomingEvents);
router.get('/events/:id', calendarController.getEvent);
router.post('/events', calendarController.createEvent);
router.put('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);
router.put('/events/:id/attendee', calendarController.updateAttendeeStatus);

export default router;
