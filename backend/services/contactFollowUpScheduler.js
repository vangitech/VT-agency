import cron from 'node-cron';
import ContactMessage from '../models/ContactMessage.js';
import Contact from '../models/Contact.js';
import Interaction from '../models/Interaction.js';
import { sendFollowUpEmail } from './mailer.js';

async function processFollowUps() {
  const threeDaysAgoStart = new Date();
  threeDaysAgoStart.setDate(threeDaysAgoStart.getDate() - 3);
  threeDaysAgoStart.setHours(0, 0, 0, 0);

  const threeDaysAgoEnd = new Date(threeDaysAgoStart);
  threeDaysAgoEnd.setHours(23, 59, 59, 999);

  const messages = await ContactMessage.find({
    createdAt: { $gte: threeDaysAgoStart, $lte: threeDaysAgoEnd },
    followUpSent: false,
  });

  if (messages.length === 0) {
    console.log('[FollowUpScheduler] No messages due for follow-up today');
    return;
  }

  console.log(`[FollowUpScheduler] Processing ${messages.length} follow-up(s)`);

  for (const msg of messages) {
    try {
      await sendFollowUpEmail({ to: msg.email, name: msg.name });

      msg.followUpSent = true;
      await msg.save();

      const contact = await Contact.findOne({ email: msg.email.toLowerCase() });
      if (contact) {
        await Interaction.create({
          contact: contact._id,
          type: 'email',
          subject: 'Just Checking In — How Can We Help You?',
          description: 'Automated 3-day follow-up email sent to inquire about service needs.',
          metadata: { followUp: true, contactMessageId: msg._id },
        });
      }

      console.log(`[FollowUpScheduler] Follow-up sent to ${msg.email}`);
    } catch (err) {
      console.error(`[FollowUpScheduler] Failed for ${msg.email}:`, err.message);
    }
  }

  console.log('[FollowUpScheduler] Batch complete');
}

export function startContactFollowUpScheduler() {
  cron.schedule('0 9 * * *', () => {
    console.log('[FollowUpScheduler] Running daily check...');
    processFollowUps().catch((err) =>
      console.error('[FollowUpScheduler] Error:', err)
    );
  });

  console.log('[FollowUpScheduler] Scheduled daily at 9:00 AM');

  processFollowUps().catch((err) =>
    console.error('[FollowUpScheduler] Initial run error:', err)
  );
}
