import { env } from '../config/env';
import { logger } from '../config/logger';
import { escapeHtml } from '../utils/escape-html';

interface NotificationField {
  label: string;
  value: string | string[] | undefined;
}

/**
 * Sends an admin notification through Resend's HTTP API. Failures are logged, never thrown:
 * the submission is already saved in the database, so the visitor should still see success.
 */
export async function notifyAdmin(subject: string, fields: NotificationField[], replyTo?: string): Promise<void> {
  if (!env.RESEND_API_KEY || !env.ADMIN_NOTIFY_EMAIL || !env.EMAIL_FROM) {
    logger.debug({ subject }, 'Email not configured; skipping admin notification');
    return;
  }

  const rows = fields
    .filter((field) => field.value && (!Array.isArray(field.value) || field.value.length > 0))
    .map((field) => {
      const value = Array.isArray(field.value) ? field.value.join(', ') : (field.value ?? '');
      return `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${escapeHtml(field.label)}</td><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`;
    })
    .join('');

  const text = fields
    .filter((field) => field.value && (!Array.isArray(field.value) || field.value.length > 0))
    .map((field) => `${field.label}: ${Array.isArray(field.value) ? field.value.join(', ') : field.value}`)
    .join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [env.ADMIN_NOTIFY_EMAIL],
        subject: subject.replace(/[\r\n]/g, ' ').slice(0, 200),
        html: `<h2>${escapeHtml(subject)}</h2><table>${rows}</table>`,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      logger.error({ status: response.status }, 'Admin notification email was rejected');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to send admin notification email');
  }
}
