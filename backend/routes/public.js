import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import Testimonial from '../models/Testimonial.js';
import News from '../models/News.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import PageContent from '../models/PageContent.js';
import Setting from '../models/Setting.js';
import ContactMessage from '../models/ContactMessage.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';
import QuoteRequest from '../models/QuoteRequest.js';
import { sendSupportNotification, sendWelcomeEmail, sendQuoteNotification, sendQuoteConfirmation } from '../services/mailer.js';

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

    // Auto-create/update unified contact profile
    let contact = await Contact.findOne({ email: email.toLowerCase() });
    if (!contact) {
      contact = await Contact.create({ name, email: email.toLowerCase(), source: 'contact_form' });
    }
    await Interaction.create({
      contact: contact._id,
      type: 'form_submission',
      subject,
      description: message,
      linkedMessage: contactMessage._id,
    });

    // Send notification to support team
    await sendSupportNotification({ name, email, subject, message }).catch((err) => {
      console.error('[Contact] Failed to send support notification:', err.message);
    });

    // Send welcome email to the visitor
    await sendWelcomeEmail({ to: email, name }).catch((err) => {
      console.error('[Contact] Failed to send welcome email:', err.message);
    });

    // Log welcome email as an interaction
    await Interaction.create({
      contact: contact._id,
      type: 'email',
      subject: 'Welcome to Vangitech — We\'ve Received Your Message',
      description: 'Welcome email sent automatically after contact form submission.',
    });

    res.status(201).json({ message: 'Message sent successfully', id: contactMessage._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quote-request', async (req, res) => {
  try {
    const { name, email, phone, company, projectType, budget, timeline, description } = req.body;
    if (!name || !email || !projectType || !description) {
      return res.status(400).json({ message: 'Name, email, project type, and description are required' });
    }
    const quoteRequest = await QuoteRequest.create({ name, email, phone, company, projectType, budget, timeline, description });

    // Auto-create/update unified contact profile
    let contact = await Contact.findOne({ email: email.toLowerCase() });
    if (!contact) {
      contact = await Contact.create({ name, email: email.toLowerCase(), source: 'quote_form' });
    }
    await Interaction.create({
      contact: contact._id,
      type: 'form_submission',
      subject: `Quote Request: ${projectType}`,
      description,
      linkedMessage: quoteRequest._id,
    });

    // Send notification to support team
    await sendQuoteNotification({ name, email, phone, company, projectType, budget, timeline, description }).catch((err) => {
      console.error('[Quote] Failed to send support notification:', err.message);
    });

    // Send confirmation to the requester
    await sendQuoteConfirmation({ to: email, name }).catch((err) => {
      console.error('[Quote] Failed to send confirmation email:', err.message);
    });

    // Log confirmation email as an interaction
    await Interaction.create({
      contact: contact._id,
      type: 'email',
      subject: "We've Received Your Quote Request",
      description: 'Quote confirmation email sent automatically after form submission.',
    });

    res.status(201).json({ message: 'Quote request submitted successfully', id: quoteRequest._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;