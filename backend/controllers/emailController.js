import EmailAccount from '../models/EmailAccount.js';
import EmailMessage from '../models/EmailMessage.js';
import Contact from '../models/Contact.js';
import { sendEmail } from '../services/mailer.js';

export const getAccounts = async (req, res) => {
  try {
    const accounts = await EmailAccount.find({ createdBy: req.user._id }).sort('-createdAt');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const account = await EmailAccount.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const account = await EmailAccount.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { returnDocument: 'after' }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await EmailMessage.deleteMany({ account: req.params.id });
    await EmailAccount.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { account, folder, page = 1, limit = 50, search } = req.query;
    const filter = {};
    if (account) filter.account = account;
    if (folder) filter.folder = folder;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { 'from.name': { $regex: search, $options: 'i' } },
        { 'from.address': { $regex: search, $options: 'i' } },
        { bodyText: { $regex: search, $options: 'i' } },
      ];
    }
    filter.isTrash = folder === 'TRASH' ? undefined : false;
    if (folder !== 'TRASH') filter.isTrash = false;
    if (folder === 'DRAFTS') filter.isDraft = true;
    if (folder === 'SENT') filter.isSent = true;

    const total = await EmailMessage.countDocuments(filter);
    const messages = await EmailMessage.find(filter)
      .sort({ receivedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('account', 'name email');

    res.json({ messages, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const message = await EmailMessage.findById(req.params.id).populate('account', 'name email');
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    await EmailMessage.findByIdAndUpdate(req.params.id, { isTrash: true });
    res.json({ message: 'Moved to trash' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { to, cc, bcc, subject, bodyHtml, bodyText, accountId } = req.body;
    if (!to || !subject || (!bodyHtml && !bodyText)) {
      return res.status(400).json({ message: 'To, subject, and body are required' });
    }

    const account = await EmailAccount.findById(accountId);
    if (!account) return res.status(404).json({ message: 'Email account not found' });

    const recipients = Array.isArray(to) ? to : [to];
    const recipientEmails = recipients.map((r) => (typeof r === 'string' ? r : r.address));

    const results = [];
    for (const recipient of recipientEmails) {
      try {
        await sendEmail({
          to: recipient,
          name: recipient,
          subject,
          messageBody: bodyHtml || bodyText,
        });
        results.push({ email: recipient, status: 'sent' });
      } catch (err) {
        results.push({ email: recipient, status: 'failed', error: err.message });
      }
    }

    const sentMessage = await EmailMessage.create({
      account: accountId,
      folder: 'SENT',
      from: { name: account.name, address: account.email },
      to: recipients.map((r) => ({ name: typeof r === 'string' ? r : r.name, address: typeof r === 'string' ? r : r.address })),
      cc: cc ? (Array.isArray(cc) ? cc : [cc]).map((r) => ({ name: typeof r === 'string' ? r : r.name, address: typeof r === 'string' ? r : r.address })) : [],
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]).map((r) => ({ name: typeof r === 'string' ? r : r.name, address: typeof r === 'string' ? r : r.address })) : [],
      subject,
      bodyHtml: bodyHtml || '',
      bodyText: bodyText || '',
      isSent: true,
      sentAt: new Date(),
      receivedAt: new Date(),
    });

    res.status(201).json({ message: 'Email sent', sentMessage, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleStar = async (req, res) => {
  try {
    const message = await EmailMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    message.isStarred = !message.isStarred;
    await message.save();
    res.json({ isStarred: message.isStarred });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveToFolder = async (req, res) => {
  try {
    const { folder } = req.body;
    const message = await EmailMessage.findByIdAndUpdate(req.params.id, { folder }, { returnDocument: 'after' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getThread = async (req, res) => {
  try {
    const message = await EmailMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    const threadId = message.threadId || message.messageId;
    const thread = await EmailMessage.find({
      $or: [{ threadId }, { messageId: threadId }, { inReplyTo: threadId }],
    }).sort({ receivedAt: 1 });
    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncContact = async (req, res) => {
  try {
    const message = await EmailMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    const email = message.from?.address;
    if (!email) return res.status(400).json({ message: 'No sender email' });
    let contact = await Contact.findOne({ email: email.toLowerCase() });
    if (!contact) {
      contact = await Contact.create({
        name: message.from?.name || email,
        email: email.toLowerCase(),
        source: 'email',
      });
    }
    message.contact = contact._id;
    await message.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
