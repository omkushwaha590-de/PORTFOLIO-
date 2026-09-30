import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { API, app, clearDb, loggedInAgent, startDb, stopDb } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const photo = (title: string, extra: Record<string, unknown> = {}) => ({
  title,
  image: { url: '/images/yogesh-modi.jpg', alt: `${title} photo`, caption: 'Caption' },
  location: 'Denmark',
  year: '2023',
  ...extra,
});

describe('photo gallery', () => {
  it('lets the admin add, reorder and unpublish photos; the public sees published ones in order', async () => {
    const agent = await loggedInAgent();
    const a = (await agent.post(`${API}/admin/gallery`).send(photo('Grundfos Olympics'))).body.data;
    const b = (await agent.post(`${API}/admin/gallery`).send(photo('APAC EHS Meeting'))).body.data;
    expect(a.id).toBeDefined();

    await agent.patch(`${API}/admin/gallery/reorder`).send({ ids: [b.id, a.id] });
    let pub = (await request(app).get(`${API}/gallery`)).body.data;
    expect(pub.map((item: { title: string }) => item.title)).toEqual(['APAC EHS Meeting', 'Grundfos Olympics']);

    await agent.patch(`${API}/admin/gallery/${b.id}`).send({ status: 'draft' });
    pub = (await request(app).get(`${API}/gallery`)).body.data;
    expect(pub).toHaveLength(1);

    expect((await agent.delete(`${API}/admin/gallery/${a.id}`)).status).toBe(204);
  });

  it('requires an image and rejects unsafe image URLs', async () => {
    const agent = await loggedInAgent();
    expect((await agent.post(`${API}/admin/gallery`).send({ title: 'No image' })).status).toBe(400);
    const bad = await agent.post(`${API}/admin/gallery`).send(photo('Bad', { image: { url: 'javascript:alert(1)' } }));
    expect(bad.status).toBe(400);
  });

  it('is admin-only for writes', async () => {
    expect((await request(app).post(`${API}/admin/gallery`).send(photo('x'))).status).toBe(401);
  });
});

describe('stat icons', () => {
  it('accepts known icons and rejects unknown ones', async () => {
    const agent = await loggedInAgent();
    const ok = await agent.put(`${API}/admin/settings`).send({ stats: [{ value: '16+', label: 'Years', icon: 'calendar' }, { value: '3', label: 'Auto' }] });
    expect(ok.status).toBe(200);
    expect(ok.body.data.stats[0].icon).toBe('calendar');
    expect(ok.body.data.stats[1].icon).toBe('');
    const bad = await agent.put(`${API}/admin/settings`).send({ stats: [{ value: '1', label: 'x', icon: '<svg>' }] });
    expect(bad.status).toBe(400);
  });
});
