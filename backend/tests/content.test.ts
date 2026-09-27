import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { seedContent } from '../src/scripts/seed-content';
import { API, app, clearDb, loggedInAgent, startDb, stopDb } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const baseProject = {
  title: 'Supplier Quality Programme',
  shortDescription: 'Reduced supplier PPM through audits and capability building.',
  category: 'AI',
  technologies: ['Six Sigma', 'Power BI'],
};

describe('projects', () => {
  it('creates projects with unique auto-generated slugs', async () => {
    const agent = await loggedInAgent();
    const first = await agent.post(`${API}/admin/projects`).send(baseProject);
    const second = await agent.post(`${API}/admin/projects`).send(baseProject);

    expect(first.status).toBe(201);
    expect(first.body.data.slug).toBe('supplier-quality-programme');
    expect(first.body.data.id).toBeDefined();
    expect(first.body.data._id).toBeUndefined();
    expect(second.body.data.slug).toBe('supplier-quality-programme-2');
  });

  it('hides drafts publicly and shows them once published', async () => {
    const agent = await loggedInAgent();
    const { body } = await agent.post(`${API}/admin/projects`).send(baseProject);

    expect((await request(app).get(`${API}/projects`)).body.data).toHaveLength(0);
    expect((await request(app).get(`${API}/projects/${body.data.slug}`)).status).toBe(404);

    await agent.patch(`${API}/admin/projects/${body.data.id}`).send({ status: 'published', featured: true });

    const list = await request(app).get(`${API}/projects`);
    expect(list.body.data).toHaveLength(1);
    // Card payload only — heavy case-study fields are not in the list.
    expect(list.body.data[0].problem).toBeUndefined();

    const detail = await request(app).get(`${API}/projects/${body.data.slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.title).toBe(baseProject.title);
  });

  it('filters by category (case-insensitive) and featured', async () => {
    const agent = await loggedInAgent();
    await agent.post(`${API}/admin/projects`).send({ ...baseProject, status: 'published', featured: true });
    await agent.post(`${API}/admin/projects`).send({ ...baseProject, title: 'Web thing', category: 'Web', status: 'published' });

    expect((await request(app).get(`${API}/projects?category=ai`)).body.data).toHaveLength(1);
    expect((await request(app).get(`${API}/projects?category=All`)).body.data).toHaveLength(2);
    expect((await request(app).get(`${API}/projects?featured=true`)).body.data).toHaveLength(1);
  });

  it('returns previous/next navigation on the detail endpoint', async () => {
    const agent = await loggedInAgent();
    for (const [i, title] of ['One', 'Two', 'Three'].entries()) {
      await agent.post(`${API}/admin/projects`).send({ ...baseProject, title, order: i, status: 'published' });
    }
    const res = await request(app).get(`${API}/projects/two`);
    expect(res.body.meta.previous.slug).toBe('one');
    expect(res.body.meta.next.slug).toBe('three');
  });

  it('rejects unknown fields, dangerous URLs and invalid ids', async () => {
    const agent = await loggedInAgent();
    const unknown = await agent.post(`${API}/admin/projects`).send({ ...baseProject, isAdmin: true });
    expect(unknown.status).toBe(400);

    const jsUrl = await agent.post(`${API}/admin/projects`).send({ ...baseProject, liveUrl: 'javascript:alert(1)' });
    expect(jsUrl.status).toBe(400);
    expect(jsUrl.body.error.details[0].path).toBe('liveUrl');

    expect((await agent.get(`${API}/admin/projects/not-an-id`)).status).toBe(400);
    expect((await agent.patch(`${API}/admin/projects/507f1f77bcf86cd799439011`).send({ title: 'x' })).status).toBe(404);
  });

  it('reorders, searches and deletes', async () => {
    const agent = await loggedInAgent();
    const a = (await agent.post(`${API}/admin/projects`).send({ ...baseProject, title: 'Alpha' })).body.data;
    const b = (await agent.post(`${API}/admin/projects`).send({ ...baseProject, title: 'Beta' })).body.data;

    const reorder = await agent.patch(`${API}/admin/projects/reorder`).send({ ids: [b.id, a.id] });
    expect(reorder.status).toBe(200);
    const ordered = await agent.get(`${API}/admin/projects`);
    expect(ordered.body.data.map((p: { title: string }) => p.title)).toEqual(['Beta', 'Alpha']);

    const search = await agent.get(`${API}/admin/projects?search=alp`);
    expect(search.body.data).toHaveLength(1);

    // Regex metacharacters are escaped, not interpreted.
    expect((await agent.get(`${API}/admin/projects?search=.*`)).body.data).toHaveLength(0);

    expect((await agent.delete(`${API}/admin/projects/${a.id}`)).status).toBe(204);
    expect((await agent.get(`${API}/admin/projects`)).body.meta.total).toBe(1);
  });
});

describe('services, testimonials, skills', () => {
  it('supports CRUD and only exposes published items publicly', async () => {
    const agent = await loggedInAgent();
    const service = await agent
      .post(`${API}/admin/services`)
      .send({ title: 'Quality Transformation', shortDescription: 'End-to-end QMS uplift', icon: 'shield-check', status: 'published' });
    expect(service.status).toBe(201);
    expect(service.body.data.slug).toBe('quality-transformation');

    const badIcon = await agent.post(`${API}/admin/services`).send({ title: 'X', shortDescription: 'Y', icon: '<svg onload=alert(1)>' });
    expect(badIcon.status).toBe(400);

    await agent.post(`${API}/admin/testimonials`).send({ clientName: 'A', testimonial: 'Great', status: 'draft' });
    await agent.post(`${API}/admin/skills`).send({ name: 'Six Sigma', category: 'Methods' });

    expect((await request(app).get(`${API}/services`)).body.data).toHaveLength(1);
    expect((await request(app).get(`${API}/services/quality-transformation`)).status).toBe(200);
    expect((await request(app).get(`${API}/testimonials`)).body.data).toHaveLength(0);
    expect((await request(app).get(`${API}/skills`)).body.data).toHaveLength(1);
  });
});

describe('starter content', () => {
  it('seeds the profile and serves it through the public API', async () => {
    await seedContent();
    // Second run is a no-op.
    expect((await seedContent()).every((line) => line.includes('skipped'))).toBe(true);

    const settings = (await request(app).get(`${API}/settings`)).body.data;
    expect(settings.profile.name).toBe('Yogesh N Modi');
    expect(settings.stats).toHaveLength(4);

    const projects = await request(app).get(`${API}/projects?featured=true`);
    expect(projects.body.data.length).toBeGreaterThanOrEqual(3);

    const detail = await request(app).get(`${API}/projects/supplier-ppm-reduction-programme`);
    expect(detail.body.data.results[0].value).toBe('2,500+');

    // A forced reseed right after seeding must replace every collection, never leave one empty.
    await seedContent({ force: true });
    await seedContent({ force: true });
    expect((await request(app).get(`${API}/services`)).body.data).toHaveLength(6);

    const experience = (await request(app).get(`${API}/experience`)).body.data;
    expect(experience.filter((entry: { kind: string }) => entry.kind === 'work')).toHaveLength(3);
    expect((await request(app).get(`${API}/services`)).body.data).toHaveLength(6);
  });
});

describe('settings & dashboard', () => {
  it('serves public settings and lets admins update them', async () => {
    const pub = await request(app).get(`${API}/settings`);
    expect(pub.status).toBe(200);
    expect(pub.body.data.budgetOptions).toContain('$10,000+');

    const agent = await loggedInAgent();
    const updated = await agent.put(`${API}/admin/settings`).send({ siteName: 'Yogesh N Modi', budgetOptions: ['Small', 'Large'] });
    expect(updated.status).toBe(200);
    expect((await request(app).get(`${API}/settings`)).body.data.siteName).toBe('Yogesh N Modi');

    const dashboard = await agent.get(`${API}/admin/dashboard`);
    expect(dashboard.body.data.counts).toMatchObject({ projects: 0, newMessages: 0 });
  });
});
