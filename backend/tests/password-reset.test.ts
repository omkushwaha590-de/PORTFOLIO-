import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Admin } from '../src/models/admin.model';
import { mailer, type EmailMessage } from '../src/services/email.service';
import { ADMIN, API, app, clearDb, createAdmin, loggedInAgent, startDb, stopDb } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

// Capture outgoing email instead of sending it.
const sent: EmailMessage[] = [];
const realSend = mailer.send;
beforeEach(() => {
  sent.length = 0;
  mailer.send = async (message) => {
    sent.push(message);
    return true;
  };
});
afterEach(() => {
  mailer.send = realSend;
});

const tokenFrom = (message: EmailMessage) => message.text.match(/token=([a-f0-9]{64})/)?.[1] ?? '';
const NEW_PASSWORD = 'Brand-New-Pass-2026!';

describe('forgot password', () => {
  it('answers identically for unknown emails and sends nothing', async () => {
    await createAdmin();
    const unknown = await request(app).post(`${API}/auth/forgot-password`).send({ email: 'nobody@example.test' });
    const known = await request(app).post(`${API}/auth/forgot-password`).send({ email: ADMIN.email });
    expect(unknown.status).toBe(200);
    expect(known.status).toBe(200);
    expect(unknown.body.data.requested).toBe(known.body.data.requested);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe(ADMIN.email);
  });

  it('resets the password from the emailed link, once, and signs out other sessions', async () => {
    const agent = await loggedInAgent();
    await request(app).post(`${API}/auth/forgot-password`).send({ email: ADMIN.email });
    const token = tokenFrom(sent[0]!);
    expect(token).toHaveLength(64);
    expect(sent[0]!.text).toContain('/admin/reset-password?token=');

    const weak = await request(app).post(`${API}/auth/reset-password`).send({ token, newPassword: 'short' });
    expect(weak.status).toBe(400);

    const ok = await request(app).post(`${API}/auth/reset-password`).send({ token, newPassword: NEW_PASSWORD });
    expect(ok.status).toBe(200);

    expect((await agent.get(`${API}/auth/me`)).status).toBe(401); // old session revoked
    expect((await request(app).post(`${API}/auth/login`).send(ADMIN)).status).toBe(401); // old password gone
    expect((await request(app).post(`${API}/auth/login`).send({ email: ADMIN.email, password: NEW_PASSWORD })).status).toBe(200);

    const reused = await request(app).post(`${API}/auth/reset-password`).send({ token, newPassword: 'Another-Pass-2026!' });
    expect(reused.status).toBe(400); // single use
  });

  it('rejects expired and made-up tokens, and never stores the raw token', async () => {
    await createAdmin();
    await request(app).post(`${API}/auth/forgot-password`).send({ email: ADMIN.email });
    const token = tokenFrom(sent[0]!);

    const stored = await Admin.findOne({ email: ADMIN.email }).select('+resetTokenHash').lean();
    expect(stored?.resetTokenHash).toBeTruthy();
    expect(stored?.resetTokenHash).not.toBe(token);

    await Admin.updateOne({ email: ADMIN.email }, { $set: { resetTokenExpires: new Date(Date.now() - 1000) } });
    expect((await request(app).post(`${API}/auth/reset-password`).send({ token, newPassword: NEW_PASSWORD })).status).toBe(400);

    const madeUp = 'a'.repeat(64);
    expect((await request(app).post(`${API}/auth/reset-password`).send({ token: madeUp, newPassword: NEW_PASSWORD })).status).toBe(400);
  });
});
