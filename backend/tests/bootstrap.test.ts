import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Admin } from '../src/models/admin.model';
import { Project } from '../src/models/project.model';
import { getSettings } from '../src/models/settings.model';
import { bootstrap } from '../src/scripts/bootstrap';
import { clearDb, startDb, stopDb } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);
afterEach(() => {
  delete process.env.ADMIN_SEED_EMAIL;
  delete process.env.ADMIN_SEED_PASSWORD;
});

describe('first-start bootstrap', () => {
  it('seeds a brand-new database and creates the admin from ADMIN_SEED_*', async () => {
    process.env.ADMIN_SEED_EMAIL = 'Owner@Example.test';
    process.env.ADMIN_SEED_PASSWORD = 'A-Strong-Password-123';
    const result = await bootstrap();
    expect(result).toEqual({ seeded: true, adminCreated: true });
    expect(await Project.countDocuments()).toBeGreaterThan(0);
    expect((await Admin.findOne().lean())?.email).toBe('owner@example.test');
  });

  it('never re-seeds content the owner deleted, and never creates a second admin', async () => {
    process.env.ADMIN_SEED_EMAIL = 'owner@example.test';
    process.env.ADMIN_SEED_PASSWORD = 'A-Strong-Password-123';
    await bootstrap();
    await Project.deleteMany({});

    process.env.ADMIN_SEED_EMAIL = 'someone-else@example.test';
    const second = await bootstrap();
    expect(second).toEqual({ seeded: false, adminCreated: false });
    expect(await Project.countDocuments()).toBe(0);
    expect(await Admin.countDocuments()).toBe(1);
  });

  it('still seeds when only a default settings document exists (settings were read before setup)', async () => {
    await getSettings(); // creates the default document, as a public GET /settings does
    expect((await bootstrap()).seeded).toBe(true);
    expect(await Project.countDocuments()).toBeGreaterThan(0);
  });

  it('ignores a weak seed password', async () => {
    process.env.ADMIN_SEED_EMAIL = 'owner@example.test';
    process.env.ADMIN_SEED_PASSWORD = 'short';
    expect((await bootstrap()).adminCreated).toBe(false);
    expect(await Admin.countDocuments()).toBe(0);
  });
});
