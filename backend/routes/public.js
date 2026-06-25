import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import Testimonial from '../models/Testimonial.js';
import News from '../models/News.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import PageContent from '../models/PageContent.js';
import Setting from '../models/Setting.js';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

router.get('/hero', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/news', async (req, res) => {
  try {
    const news = await News.find({ isActive: true }).sort({ publishedAt: -1 }).limit(6);
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/news/:id', async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find({ isActive: true }).sort({ name: 1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/page-content/:page', async (req, res) => {
  try {
    const content = await PageContent.findOne({ page: req.params.page });
    if (!content) {
      return res.status(404).json({ message: 'Page content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const keys = [
      'companyName', 'companyEmail', 'companyPhone', 'companyAddress',
      'facebookUrl', 'twitterUrl', 'linkedinUrl', 'youtubeUrl',
      'footerCopyright',
    ];
    const settings = await Setting.find({ key: { $in: keys } });
    const result = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const contactMessage = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent successfully', id: contactMessage._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;