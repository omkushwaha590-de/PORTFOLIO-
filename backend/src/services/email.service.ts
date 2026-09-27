import { env } from '../config/env';
import { logger } from '../config/logger';
import { escapeHtml } from '../utils/escape-html';

interface NotificationField {
  label: string;
  value: string | string[] | undefined;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export const isEmailEnabled = () => Boolean(env.RESEND_API_KEY);

/**
 * Transport for all outgoing email (Resend HTTP API). Exposed as an object so tests can replace
 * `mailer.send`. Returns whether the message was accepted; never throws.
 */
export const mailer = {
  async send(message: EmailMessage): Promise<boolean> {
    if (!env.RESEND_API_KEY) {
      logger.debug({ subject: message.subject }, 'Email not configured; message not sent');
      return false;
    }
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [message.to],
          subject: message.subject.replace(/[\r\n]/g, ' ').slice(0, 200),
          html: message.html,
          text: message.text,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        logger.error({ status: response.status }, 'Email was rejected by the provider');
        return false;
      }
      return true;
    } catch (err) {
      logger.error({ err }, 'Failed to send email');
      return false;
    }
  },
};

/**
 * Sends an admin notification. Failures are logged, never thrown: the submission is already saved
 * in the database, so the visitor should still see success.
 */
export async function notifyAdmin(subject: string, fields: NotificationField[], replyTo?: string): Promise<void> {
  if (!env.ADMIN_NOTIFY_EMAIL) return;

  const filled = fields.filter((field) => field.value && (!Array.isArray(field.value) || field.value.length > 0));
  const asText = (value: NotificationField['value']) => (Array.isArray(value) ? value.join(', ') : (value ?? ''));

  const rows = filled
    .map(
      (field) =>
        `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${escapeHtml(field.label)}</td><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(asText(field.value))}</td></tr>`,
    )
    .join('');

  await mailer.send({
    to: env.ADMIN_NOTIFY_EMAIL,
    subject,
    html: `<h2>${escapeHtml(subject)}</h2><table>${rows}</table>`,
    text: filled.map((field) => `${field.label}: ${asText(field.value)}`).join('\n'),
    replyTo,
  });
}
