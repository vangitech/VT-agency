import dotenv from 'dotenv';
import { Octomailer, ResendProvider, BrevoProvider } from 'octomailer';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const FROM_NAME = 'Vangitech';
const FROM_EMAIL = 'info@vangitech.com';

const mailer = new Octomailer([
  new ResendProvider(RESEND_API_KEY, 3),
  new BrevoProvider(BREVO_API_KEY, 1),
]);

function buildTemplate({ name, recipientEmail, subject, messageBody }) {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db,#059669);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">VT</span>
                    <span style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:500;letter-spacing:1px;display:block;margin-top:2px;">VANGITECH</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:24px 0 0;line-height:1.3;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 24px;">Dear <strong style="color:#111827;">${name}</strong>,</p>
              <div style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 32px;">
                ${messageBody.replace(/\n/g, '<br>')}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:24px;margin:0 0 32px;width:100%;">
                <tr>
                  <td style="font-size:13px;color:#6b7280;padding-bottom:8px;">Message from:</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#111827;font-weight:600;">${name}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6b7280;">${recipientEmail}</td>
                </tr>
              </table>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">Best regards,</p>
              <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 4px;">Vangitech Team</p>
              <p style="color:#059669;font-size:13px;margin:0;">
                <a href="https://vangitech.com" style="color:#059669;text-decoration:none;">vangitech.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 16px 16px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;line-height:1.5;">
                House C18A FRSC Estate Lokogoma FCT-Abuja, Nigeria<br>
                RC 1803640
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                &copy; ${year} Vangitech Limited. All rights reserved.
              </p>
              <p style="color:#9ca3af;font-size:11px;margin:12px 0 0;line-height:1.5;">
                If you have any questions, reply to this email or contact us at
                <a href="mailto:info@vangitech.com" style="color:#1a56db;text-decoration:none;">info@vangitech.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildReplyTemplate({ originalSubject, originalMessage, replyBody, adminName }) {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db,#059669);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">VT</span>
                    <span style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:500;letter-spacing:1px;display:block;margin-top:2px;">VANGITECH</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:24px 0 0;line-height:1.3;">Re: ${originalSubject}</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <div style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 32px;">
                ${replyBody.replace(/\n/g, '<br>')}
              </div>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">Best regards,</p>
              <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 4px;">${adminName}</p>
              <p style="color:#059669;font-size:13px;margin:0 0 24px;">
                <a href="https://vangitech.com" style="color:#059669;text-decoration:none;">vangitech.com</a>
              </p>
              <div style="border-left:3px solid #e5e7eb;padding:16px 20px;background:#f9fafb;border-radius:8px;">
                <p style="color:#6b7280;font-size:12px;font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Original Message</p>
                <p style="color:#374151;font-size:13px;font-style:italic;margin:0;line-height:1.6;">${originalMessage}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 16px 16px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;line-height:1.5;">
                House C18A FRSC Estate Lokogoma FCT-Abuja, Nigeria<br>
                RC 1803640
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                &copy; ${year} Vangitech Limited. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendSupportNotification({ name, email, subject, message }) {
  const html = buildTemplate({
    name: 'Support Team',
    recipientEmail: FROM_EMAIL,
    subject: `New Contact Form Submission: ${subject}`,
    messageBody: `
You have received a new message from the contact form on vangitech.com.

<strong>From:</strong> ${name}<br>
<strong>Email:</strong> ${email}<br>
<strong>Subject:</strong> ${subject}<br>
<strong>Message:</strong><br>
${message}

Please log into the CRM to view and respond to this message.
    `.trim(),
  });

  const result = await mailer.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: ['support@vangitech.com'],
    subject: `New Contact Form Submission: ${subject}`,
    html,
    replyTo: email,
  });

  return { provider: result.provider, id: result.id };
}

export async function sendWelcomeEmail({ to, name }) {
  const html = buildTemplate({
    name,
    recipientEmail: to,
    subject: 'Welcome to Vangitech — We\'ve Received Your Message',
    messageBody: `
Thank you for reaching out to us! We have received your message and our team is reviewing it.

Here's what you can expect next:
<ul style="margin:12px 0;padding-left:20px;">
  <li style="margin-bottom:8px;">Our team will review your request within 24-48 hours</li>
  <li style="margin-bottom:8px;">A dedicated representative will reach out to you</li>
  <li style="margin-bottom:8px;">We'll provide a tailored solution based on your needs</li>
</ul>

In the meantime, feel free to explore our services at <a href="https://vangitech.com/projects" style="color:#1a56db;text-decoration:underline;">vangitech.com/services</a> to learn more about how we can help you.

If you have any urgent questions, please don't hesitate to contact us at support@vangitech.com.

We look forward to speaking with you!
    `.trim(),
  });

  const result = await mailer.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject: 'Welcome to Vangitech — We\'ve Received Your Message',
    html,
  });

  return { provider: result.provider, id: result.id };
}

export async function sendFollowUpEmail({ to, name }) {
  const html = buildTemplate({
    name,
    recipientEmail: to,
    subject: 'Just Checking In — How Can We Help You?',
    messageBody: `
I hope this message finds you well. It's been a few days since you reached out to us, and I wanted to follow up personally.

Have you had a chance to review our <a href="https://vangitech.com/projects" style="color:#1a56db;text-decoration:underline;">service list</a>? We offer a wide range of technology solutions including:

<ul style="margin:12px 0;padding-left:20px;">
  <li style="margin-bottom:6px;"><strong>Software Development</strong> — Custom web, mobile, and enterprise applications</li>
  <li style="margin-bottom:6px;"><strong>Cybersecurity</strong> — Security audits, penetration testing, and compliance</li>
  <li style="margin-bottom:6px;"><strong>IT Consulting</strong> — Technology strategy and digital transformation</li>
  <li style="margin-bottom:6px;"><strong>Cloud Solutions</strong> — Migration, architecture, and managed services</li>
</ul>

Could you let us know what specific service you're looking for? Our team is ready to provide a tailored solution for your needs.

Just reply to this email and we'll take it from there.

Best regards,
Vangitech Team
    `.trim(),
  });

  const result = await mailer.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject: 'Just Checking In — How Can We Help You?',
    html,
  });

  return { provider: result.provider, id: result.id };
}

export async function sendEmail({ to, name, subject, messageBody, replyTo }) {
  const html = buildTemplate({ name, recipientEmail: to, subject, messageBody });

  const result = await mailer.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject,
    html,
    replyTo: replyTo || FROM_EMAIL,
  });

  return { provider: result.provider, id: result.id };
}

export async function sendQuoteNotification({ name, email, phone, company, projectType, budget, timeline, description }) {
  const html = buildTemplate({
    name: 'Support Team',
    recipientEmail: FROM_EMAIL,
    subject: `New Quote Request: ${projectType}`,
    messageBody: `
You have received a new quote request from vangitech.com.

<strong>From:</strong> ${name}<br>
<strong>Email:</strong> ${email}<br>
<strong>Phone:</strong> ${phone || 'Not provided'}<br>
<strong>Company:</strong> ${company || 'Not provided'}<br>
<strong>Project Type:</strong> ${projectType}<br>
<strong>Budget:</strong> ${budget || 'Not specified'}<br>
<strong>Timeline:</strong> ${timeline || 'Not specified'}<br>
<strong>Description:</strong><br>
${description}

Please log into the CRM to view and respond to this request.
    `.trim(),
  });

  const result = await mailer.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: ['support@vangitech.com'],
    subject: `New Quote Request: ${projectType}`,
    html,
    replyTo: email,
  });

  return { provider: result.provider, id: result.id };
}

export async function sendQuoteConfirmation({ to, name }) {
  const html = buildTemplate({
    name,
    recipientEmail: to,
    subject: "We've Received Your Quote Request",
    messageBody: `
Thank you for reaching out to us! We have received your quote request and our team is reviewing it.

Here's what you can expect next:
<ul style="margin:12px 0;padding-left:20px;">
  <li style="margin-bottom:8px;">Our team will review your project requirements within 24-48 hours</li>
  <li style="margin-bottom:8px;">A dedicated representative will reach out to discuss your needs</li>
  <li style="margin-bottom:8px;">We'll provide a tailored quote based on your specifications</li>
</ul>

In the meantime, feel free to explore our services at <a href="https://vangitech.com/projects" style="color:#1a56db;text-decoration:underline;">vangitech.com/services</a> to learn more about how we can help you.

If you have any urgent questions, please don't hesitate to contact us at support@vangitech.com.

We look forward to working with you!
    `.trim(),
  });

  const result = await mailer.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject: "We've Received Your Quote Request",
    html,
  });

  return { provider: result.provider, id: result.id };
}

export async function sendReply({ to, name, originalSubject, originalMessage, replyBody, adminName }) {
  const subject = `Re: ${originalSubject}`;
  const html = buildReplyTemplate({ originalSubject, originalMessage, replyBody, adminName });

  const result = await mailer.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject,
    html,
    replyTo: FROM_EMAIL,
  });

  return { provider: result.provider, id: result.id };
}