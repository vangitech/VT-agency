import ContactMessage from '../models/ContactMessage.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';
import { sendReply } from '../services/mailer.js';

// ── Contact Messages ──

export const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { returnDocument: 'after' }
    );
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendReplyMessage = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Reply body is required' });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const adminName = req.user?.name || 'Vangitech Team';

    const result = await sendReply({
      to: message.email,
      name: message.name,
      originalSubject: message.subject,
      originalMessage: message.message,
      replyBody: body,
      adminName,
    });

    message.replied = true;
    message.read = true;
    message.replies.push({
      body,
      adminName,
      provider: result.provider,
    });
    await message.save();

    // Log interaction on the linked contact
    const contact = await Contact.findOne({ email: message.email.toLowerCase() });
    if (contact) {
      await Interaction.create({
        contact: contact._id,
        type: 'email',
        subject: `Re: ${message.subject}`,
        description: body,
        outcome: 'Sent via CRM',
        linkedMessage: message._id,
      });
    }

    res.json({ success: true, provider: result.provider, message: 'Reply sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await ContactMessage.countDocuments();
    const unread = await ContactMessage.countDocuments({ read: false });
    const replied = await ContactMessage.countDocuments({ replied: true });
    const contacts = await Contact.countDocuments();
    res.json({ total, unread, replied, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Contacts (Unified Profiles) ──

export const getContacts = async (req, res) => {
  try {
    const { search, industry, tag } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    if (industry) query.industry = industry;
    if (tag) query.tags = tag;

    const contacts = await Contact.find(query).sort({ updatedAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    const interactions = await Interaction.find({ contact: contact._id })
      .sort({ createdAt: -1 })
      .populate('linkedMessage');

    const messages = await ContactMessage.find({
      email: { $regex: `^${contact.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    }).sort({ createdAt: -1 });

    res.json({ contact, interactions, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await Contact.findOne({ email: email.toLowerCase() });
    if (existing) {
      Object.assign(existing, req.body);
      if (req.body.name) existing.name = req.body.name;
      await existing.save();
      return res.json(existing);
    }

    const contact = await Contact.create({ ...req.body, email: email.toLowerCase() });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    await Interaction.deleteMany({ contact: contact._id });
    res.json({ message: 'Contact and interactions deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Interactions ──

export const addInteraction = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    const interaction = await Interaction.create({
      contact: contact._id,
      ...req.body,
    });

    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find({ contact: req.params.id })
      .sort({ createdAt: -1 })
      .populate('linkedMessage');
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Deduplication ──

export const findDuplicates = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { email: { $toLower: '$email' } },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          names: { $push: '$name' },
          companies: { $push: '$company' },
          sources: { $push: '$source' },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ];

    const duplicates = await Contact.aggregate(pipeline);
    res.json(duplicates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const mergeDuplicates = async (req, res) => {
  try {
    const { keepId, mergeId } = req.body;
    if (!keepId || !mergeId) {
      return res.status(400).json({ message: 'keepId and mergeId are required' });
    }
    if (keepId === mergeId) {
      return res.status(400).json({ message: 'Cannot merge a contact with itself' });
    }

    const keep = await Contact.findById(keepId);
    const merge = await Contact.findById(mergeId);
    if (!keep || !merge) {
      return res.status(404).json({ message: 'One or both contacts not found' });
    }

    // Merge fields: prefer non-empty values from the one being kept
    const fields = ['name', 'email', 'phone', 'title', 'company', 'industry', 'companySize', 'website', 'location', 'notes'];
    for (const field of fields) {
      if (!keep[field] && merge[field]) keep[field] = merge[field];
    }

    // Merge tags
    const allTags = new Set([...(keep.tags || []), ...(merge.tags || [])]);
    keep.tags = [...allTags];

    // Merge social links
    if (!keep.socialLinks?.linkedin && merge.socialLinks?.linkedin) {
      keep.socialLinks.linkedin = merge.socialLinks.linkedin;
    }
    if (!keep.socialLinks?.twitter && merge.socialLinks?.twitter) {
      keep.socialLinks.twitter = merge.socialLinks.twitter;
    }

    // Reassign interactions
    await Interaction.updateMany({ contact: mergeId }, { contact: keepId });

    // Add merge note
    await Interaction.create({
      contact: keepId,
      type: 'note',
      subject: 'Duplicate Merged',
      description: `Merged duplicate contact "${merge.name}" (${merge.email}) into this profile. Fields consolidated.`,
    });

    await keep.save();
    await Contact.findByIdAndDelete(mergeId);

    res.json({ message: 'Duplicates merged successfully', contact: keep });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Auto-create contact from incoming message ──

export const syncMessageToContact = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    let contact = await Contact.findOne({ email: message.email.toLowerCase() });

    if (!contact) {
      contact = await Contact.create({
        name: message.name,
        email: message.email.toLowerCase(),
        source: 'contact_form',
      });
    }

    // Log as interaction
    const existing = await Interaction.findOne({ linkedMessage: message._id });
    if (!existing) {
      await Interaction.create({
        contact: contact._id,
        type: 'form_submission',
        subject: message.subject,
        description: message.message,
        linkedMessage: message._id,
      });
    }

    res.json({ contact, message: 'Contact synced' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};