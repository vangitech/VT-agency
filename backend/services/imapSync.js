import { createRequire } from 'module';
import EmailAccount from '../models/EmailAccount.js';
import EmailMessage from '../models/EmailMessage.js';

const require = createRequire(import.meta.url);
const imaps = require('imap-simple');

function decodeBase64(input) {
  const b = Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  try { return b.toString('utf-8'); } catch { return b.toString('latin1'); }
}

function decodeMimeWords(input) {
  if (!input) return '';
  return input.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, charset, encoding, text) => {
    if (encoding.toUpperCase() === 'B') return decodeBase64(text);
    if (encoding.toUpperCase() === 'Q') {
      return text.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    }
    return text;
  });
}

function buildAddresses(raw) {
  if (!raw) return [];
  if (typeof raw === 'string') {
    const match = raw.match(/^"?([^"]*)"?\s*<([^>]+)>|^(.+)$/);
    if (match) {
      return [{ name: decodeMimeWords(match[1] || match[3] || ''), address: (match[2] || match[3] || '').toLowerCase() }];
    }
    return [{ name: '', address: raw.toLowerCase() }];
  }
  if (Array.isArray(raw)) return raw.map(a => ({ name: decodeMimeWords(a.name || ''), address: (a.address || '').toLowerCase() }));
  return [{ name: decodeMimeWords(raw.name || ''), address: (raw.address || '').toLowerCase() }];
}

function getTextFromParts(struct) {
  let text = '';
  function walk(parts) {
    if (!parts) return;
    for (const p of parts) {
      if (p.type === 'text' && p.subtype === 'plain' && p.partID) text = p.partID;
      if (p.type === 'multipart' && p.subtype === 'alternative') walk(p.childNodes);
    }
  }
  walk(struct);
  return text || '1';
}

function getHtmlFromParts(struct) {
  let html = '';
  function walk(parts) {
    if (!parts) return;
    for (const p of parts) {
      if (p.type === 'text' && p.subtype === 'html' && p.partID) html = p.partID;
      if (p.type === 'multipart' && p.subtype === 'alternative') walk(p.childNodes);
    }
  }
  walk(struct);
  return html || '1';
}

function extractAttachments(struct) {
  const atts = [];
  function walk(parts) {
    if (!parts) return;
    for (const p of parts) {
      if (p.disposition && p.disposition.type === 'attachment' && p.params && p.params.name) {
        atts.push({ partID: p.partID, filename: p.params.name, contentType: p.type + '/' + p.subtype, size: p.size || 0 });
      }
      if (p.childNodes) walk(p.childNodes);
    }
  }
  walk(struct);
  return atts;
}

export const syncAccount = async (accountId) => {
  const account = await EmailAccount.findById(accountId);
  if (!account) throw new Error('Email account not found');
  if (!account.imapHost || !account.username || !account.password) {
    throw new Error('IMAP configuration incomplete');
  }

  const config = {
    imap: {
      user: account.username,
      password: account.password,
      host: account.imapHost,
      port: account.imapPort || 993,
      tls: account.imapSecure !== false,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000,
    },
  };

  let connection;
  try {
    connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const sinceDate = account.lastSynced || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const searchCriteria = ['UNSEEN', ['SINCE', sinceDate.toISOString()]];
    const fetchOptions = {
      bodies: ['HEADER.FIELDS (FROM TO CC BCC SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)', 'TEXT'],
      struct: true,
      markSeen: false,
    };

    const results = await connection.search(searchCriteria, fetchOptions);

    const synced = [];
    for (const msg of results) {
      const header = msg.parts.find(p => p.which === 'HEADER.FIELDS (FROM TO CC BCC SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)');
      if (!header) continue;
      const hdr = header.body;
      const messageId = (hdr['message-id'] && hdr['message-id'][0]) || '';
      if (!messageId) continue;

      const exists = await EmailMessage.findOne({ messageId });
      if (exists) continue;

      const subject = decodeMimeWords((hdr.subject && hdr.subject[0]) || '(No Subject)');
      const from = buildAddresses(hdr.from && hdr.from[0]);
      const to = buildAddresses(hdr.to);
      const cc = buildAddresses(hdr.cc);
      const bcc = buildAddresses(hdr.bcc);
      const receivedAt = hdr.date ? new Date(hdr.date[0]) : new Date();
      const inReplyTo = (hdr['in-reply-to'] && hdr['in-reply-to'][0]) || '';
      const references = hdr.references || [];
      const threadId = inReplyTo || (references.length > 0 ? references[0] : messageId);

      const struct = msg.attributes.struct;
      const textPartId = getTextFromParts(struct);
      const htmlPartId = getHtmlFromParts(struct);

      const textBody = msg.parts.find(p => p.which === String(textPartId) || (typeof p.which === 'string' && p.which.startsWith(String(textPartId))));
      const htmlBody = msg.parts.find(p => p.which === String(htmlPartId) || (typeof p.which === 'string' && p.which.startsWith(String(htmlPartId))));

      let bodyText = '';
      let bodyHtml = '';
      if (textBody) bodyText = textBody.body || '';
      if (htmlBody) bodyHtml = htmlBody.body || '';
      if (!bodyText && !bodyHtml) {
        const textPart = msg.parts.find(p => p.which === 'TEXT');
        if (textPart) bodyText = textPart.body || '';
      }

      const attachments = extractAttachments(struct);

      const emailMessage = await EmailMessage.create({
        account: accountId,
        messageId,
        folder: 'INBOX',
        from: from[0] || { name: '', address: '' },
        to,
        cc,
        bcc,
        subject,
        bodyHtml: bodyHtml || '',
        bodyText: bodyText || '',
        attachments: attachments.map(a => ({
          filename: a.filename,
          contentType: a.contentType,
          size: a.size,
          url: '',
        })),
        isRead: false,
        isStarred: false,
        receivedAt,
        sentAt: receivedAt,
        inReplyTo: inReplyTo || '',
        references: Array.isArray(references) ? references : [],
        threadId,
      });

      synced.push(emailMessage._id);
    }

    await connection.end();

    account.lastSynced = new Date();
    await account.save();

    return { synced: synced.length };
  } catch (error) {
    if (connection) {
      try { await connection.end(); } catch {}
    }
    throw error;
  }
};

export const syncAllAccounts = async () => {
  const accounts = await EmailAccount.find({ isActive: true, imapHost: { $ne: '' } });
  const results = [];
  for (const account of accounts) {
    try {
      const result = await syncAccount(account._id);
      results.push({ account: account.email, status: 'ok', synced: result.synced });
    } catch (error) {
      results.push({ account: account.email, status: 'error', error: error.message });
    }
  }
  return results;
};
