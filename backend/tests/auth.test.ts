import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Admin } from '../src/models/admin.model';
import { SESSION_COOKIE } from '../src/services/auth.service';
import { ADMIN, API, app, clearDb, createAdmin, loggedInAgent, startDb, stopDb } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('authentication', () => {
  it('logs in with an httpOnly session cookie and never returns the password hash', async () => {
    await createAdmin();
    const res = await request(app).post(`${API}/auth/login`).send(ADMIN);

    expect(res.status).toBe(200);
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain(`${SESSION_COOKIE}=`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('returns the same generic error for unknown email and wrong password', async () => {
    await createAdmin();
    const wrongPassword = await request(app).post(`${API}/auth/login`).send({ ...ADMIN, password: 'nope' });
    const unknownEmail = await request(app).post(`${API}/auth/login`).send({ email: 'x@example.test', password: 'nope' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
  });

  it('locks the account after repeated failures, even for the correct password', async () => {
    await createAdmin();
    for (let i = 0; i < 5; i++) {
      await request(app).post(`${API}/auth/login`).send({ ...ADMIN, password: 'wrong-password' });
    }
    const res = await request(app).post(`${API}/auth/login`).send(ADMIN);
    expect(res.status).toBe(429);
  });

  it('rejects NoSQL operator injection in the login body', async () => {
    await createAdmin();
    const res = await request(app).post(`${API}/auth/login`).send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
  });

  it('protects every admin route on the server', async () => {
    for (const path of ['/admin/dashboard', '/admin/projects', '/admin/messages', '/admin/quotes', '/admin/settings', '/auth/me']) {
      const res = await request(app).get(`${API}${path}`);
      expect(res.status, path).toBe(401);
    }
    const create = await request(app).post(`${API}/admin/projects`).send({ title: 'x' });
    expect(create.status).toBe(401);
  });

  it('rejects forged and tampered tokens', async () => {
    const admin = await createAdmin();
    const forged = jwt.sign({ ver: 0 }, 'some-other-secret-that-is-long-enough-000000', {
      subject: String(admin._id),
      issuer: 'portfolio-api',
      audience: 'portfolio-admin',
    });
    const res = await request(app).get(`${API}/auth/me`).set('Cookie', `${SESSION_COOKIE}=${forged}`);
    expect(res.status).toBe(401);
  });

  it('revokes existing sessions when tokenVersion changes', async () => {
    const agent = await loggedInAgent();
    expect((await agent.get(`${API}/auth/me`)).status).toBe(200);

    await Admin.updateOne({ email: ADMIN.email }, { $inc: { tokenVersion: 1 } });
    expect((await agent.get(`${API}/auth/me`)).status).toBe(401);
  });

  it('logout clears the cookie; "everywhere" revokes all sessions', async () => {
    const agent = await loggedInAgent();
    const other = await (async () => {
      const second = request.agent(app);
      await second.post(`${API}/auth/login`).send(ADMIN);
      return second;
    })();

    const res = await agent.post(`${API}/auth/logout`).send({ everywhere: true });
    expect(res.status).toBe(204);
    expect((await agent.get(`${API}/auth/me`)).status).toBe(401);
    expect((await other.get(`${API}/auth/me`)).status).toBe(401);
  });

  it('changes the password with policy enforcement', async () => {
    const agent = await loggedInAgent();
    const weak = await agent.post(`${API}/auth/change-password`).send({ currentPassword: ADMIN.password, newPassword: 'short' });
    expect(weak.status).toBe(400);

    const ok = await agent
      .post(`${API}/auth/change-password`)
      .send({ currentPassword: ADMIN.password, newPassword: 'A-much-Stronger-Pass-42' });
    expect(ok.status).toBe(200);
    // The same agent received a fresh cookie and stays signed in.
    expect((await agent.get(`${API}/auth/me`)).status).toBe(200);
    // The old password no longer works.
    expect((await request(app).post(`${API}/auth/login`).send(ADMIN)).status).toBe(401);
  });

  it('blocks state-changing requests from disallowed origins', async () => {
    await createAdmin();
    const res = await request(app).post(`${API}/auth/login`).set('Origin', 'https://evil.example').send(ADMIN);
    expect(res.status).toBe(403);
  });
});
