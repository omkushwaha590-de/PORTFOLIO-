import { rm } from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Message } from '../src/models/message.model';
import { UPLOAD_DIR } from '../src/services/storage.service';
import { API, app, clearDb, loggedInAgent, startDb, stopDb } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const contact = {
  name: 'Jane Client',
  email: 'Jane@Example.com',
  phone: '+91 98765 43210',
  company: 'Acme',
  projectType: 'Quality Transformation',
  budget: '$5,000–$10,000',
  message: 'We would like to discuss a project.',
};

const quote = {
  name: 'Jane Client',
  email: 'jane@example.com',
  projectType: 'Supplier Quality Development',
  budget: '$10,000+',
  timeline: '1–3 months',
  description: 'An internal quality dashboard.',
  requirements: ['Auth', 'Reports'],
};

describe('contact form', () => {
  it('stores a valid message and normalises the email', async () => {
    const res = await request(app).post(`${API}/contact`).send(contact);
    expect(res.status).toBe(201);
    const saved = await Message.findById(res.body.data.id).lean();
    expect(saved?.email).toBe('jane@example.com');
    expect(saved?.status).toBe('new');
  });

  it('silently drops honeypot submissions', async () => {
    const res = await request(app).post(`${API}/contact`).send({ ...contact, website: 'http://spam.example' });
    expect(res.status).toBe(201);
    expect(await Message.countDocuments()).toBe(0);
  });

  it('validates input and configured options', async () => {
    expect((await request(app).post(`${API}/contact`).send({ ...contact, email: 'nope' })).status).toBe(400);
    expect((await request(app).post(`${API}/contact`).send({ ...contact, budget: 'A million' })).status).toBe(400);
    expect((await request(app).post(`${API}/contact`).send({ ...contact, message: '' })).status).toBe(400);
    expect((await request(app).post(`${API}/contact`).send({ ...contact, notes: 'set by attacker' })).status).toBe(400);
  });
});

describe('quotation flow', () => {
  it('accepts a quote and lets the admin manage it', async () => {
    const created = await request(app).post(`${API}/quotes`).send(quote);
    expect(created.status).toBe(201);

    const agent = await loggedInAgent();
    const list = await agent.get(`${API}/admin/quotes?status=new`);
    expect(list.body.data).toHaveLength(1);

    const id = list.body.data[0].id;
    const patched = await agent.patch(`${API}/admin/quotes/${id}`).send({ status: 'reviewing', notes: 'Call on Monday' });
    expect(patched.body.data.status).toBe('reviewing');

    const invalid = await agent.patch(`${API}/admin/quotes/${id}`).send({ status: 'paid' });
    expect(invalid.status).toBe(400);

    expect((await agent.delete(`${API}/admin/quotes/${id}`)).status).toBe(204);
  });

  it('requires the core fields but not a budget', async () => {
    const { description: _omitDescription, ...withoutDescription } = quote;
    expect((await request(app).post(`${API}/quotes`).send(withoutDescription)).status).toBe(400);

    const { budget: _omitBudget, ...withoutBudget } = quote;
    expect((await request(app).post(`${API}/quotes`).send(withoutBudget)).status).toBe(201);
  });
});

describe('uploads', () => {
  afterAll(() => rm(UPLOAD_DIR, { recursive: true, force: true }));

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.alloc(64),
  ]);

  it('accepts a real image and stores it under a random name', async () => {
    const agent = await loggedInAgent();
    const res = await agent.post(`${API}/admin/uploads`).attach('file', png, { filename: '../../evil.php', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.data.mime).toBe('image/png');
    expect(path.basename(res.body.data.url)).toMatch(/^[0-9a-f-]{36}\.png$/);
  });

  it('rejects files whose content is not an image, whatever they claim to be', async () => {
    const agent = await loggedInAgent();
    const fake = Buffer.from('<?php system($_GET["c"]); ?>'.padEnd(64, ' '));
    const res = await agent.post(`${API}/admin/uploads`).attach('file', fake, { filename: 'photo.png', contentType: 'image/png' });
    expect(res.status).toBe(400);

    const svg = await agent
      .post(`${API}/admin/uploads`)
      .attach('file', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), {
        filename: 'x.svg',
        contentType: 'image/svg+xml',
      });
    expect(svg.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).post(`${API}/admin/uploads`).attach('file', png, { filename: 'a.png', contentType: 'image/png' });
    expect(res.status).toBe(401);
  });
});

describe('security headers', () => {
  it('sets hardened headers on API responses', async () => {
    const res = await request(app).get(`${API}/settings`);
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['permissions-policy']).toContain('camera=()');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('only grants CORS to configured origins', async () => {
    const allowed = await request(app).get(`${API}/settings`).set('Origin', 'http://localhost:3000');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');

    const denied = await request(app).get(`${API}/settings`).set('Origin', 'https://evil.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('returns JSON 404s for unknown routes', async () => {
    const res = await request(app).get(`${API}/nope`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
