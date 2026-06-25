import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Image upload
router.post('/upload', upload.single('image'), adminController.uploadImage);

// Hero Slides
router.route('/hero')
  .get(adminController.getHeroSlides)
  .post(adminController.createHeroSlide);
router.route('/hero/:id')
  .put(adminController.updateHeroSlide)
  .delete(adminController.deleteHeroSlide);

// Testimonials
router.route('/testimonials')
  .get(adminController.getTestimonials)
  .post(adminController.createTestimonial);
router.route('/testimonials/:id')
  .put(adminController.updateTestimonial)
  .delete(adminController.deleteTestimonial);

// News
router.get('/news/fetch-from-api', adminController.fetchNewsFromAPI);
router.post('/news/import-from-api', adminController.importNewsFromAPI);
router.post('/news/auto-fetch', adminController.triggerAutoFetch);
router.get('/news/auto-fetch-info', adminController.getAutoFetchInfo);
router.route('/news')
  .get(adminController.getNews)
  .post(adminController.createNews);
router.route('/news/:id')
  .put(adminController.updateNews)
  .delete(adminController.deleteNews);

// Clients
router.route('/clients')
  .get(adminController.getClients)
  .post(adminController.createClient);
router.route('/clients/:id')
  .put(adminController.updateClient)
  .delete(adminController.deleteClient);

// Projects
router.route('/projects')
  .get(adminController.getProjects)
  .post(adminController.createProject);
router.route('/projects/:id')
  .put(adminController.updateProject)
  .delete(adminController.deleteProject);

// Page Content
router.route('/page-content/:page')
  .get(adminController.getPageContent)
  .put(adminController.updatePageContent);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Contact Messages
router.get('/messages', adminController.getContactMessages);
router.put('/messages/:id/read', adminController.markMessageRead);
router.delete('/messages/:id', adminController.deleteContactMessage);

export default router;