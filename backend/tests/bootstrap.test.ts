import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Admin } from '../src/models/admin.model';
import { Project } from '../src/models/project.model';
import { getSettings } from '../src/models/settings.model';
import { bootstrap } from '../src/scripts/bootstrap';
import { authenticate, changePassword } from '../src/services/auth.service';
import { clearDb, startDb, stopDb } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);
afterEach(() => {
  for (const key of ['ADMIN_SEED_EMAIL', 'ADMIN_SEED_PASSWORD', 'ADMIN_RESET_ID', 'ADMIN_RESET_PASSWORD', 'ADMIN_RESET_EMAIL']) {
    delete process.env[key];
  }
});

describe('first-start bootstrap', () => {
  it('seeds a brand-new database and creates the admin from ADMIN_SEED_*', async () => {
    process.env.ADMIN_SEED_EMAIL = 'Owner@Example.test';
    process.env.ADMIN_SEED_PASSWORD = 'A-Strong-Password-123';
    const result = await bootstrap();
    expect(result).toEqual({ seeded: true, adminCreated: true, loginReset: false });
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
    expect(second).toEqual({ seeded: false, adminCreated: false, loginReset: false });
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

  it('applies a login reset exactly once and never overwrites a later password change', async () => {
    process.env.ADMIN_SEED_EMAIL = 'owner@example.test';
    process.env.ADMIN_SEED_PASSWORD = 'A-Strong-Password-123';
    await bootstrap();

    process.env.ADMIN_RESET_ID = 'reset-0001';
    process.env.ADMIN_RESET_PASSWORD = 'Recovered-Pass-456!';
    process.env.ADMIN_RESET_EMAIL = 'Recovered@Example.test';
    expect((await bootstrap()).loginReset).toBe(true);
    const admin = await authenticate('recovered@example.test', 'Recovered-Pass-456!');

    // The owner later changes the password in the dashboard; a restart must not undo it.
    await changePassword(String(admin._id), 'Recovered-Pass-456!', 'Changed-Later-789!');
    expect((await bootstrap()).loginReset).toBe(false);
    await expect(authenticate('recovered@example.test', 'Changed-Later-789!')).resolves.toBeTruthy();

    // A new reset id applies again (email optional: kept when blank).
    process.env.ADMIN_RESET_ID = 'reset-0002';
    process.env.ADMIN_RESET_PASSWORD = 'Second-Reset-321!';
    process.env.ADMIN_RESET_EMAIL = '';
    expect((await bootstrap()).loginReset).toBe(true);
    await expect(authenticate('recovered@example.test', 'Second-Reset-321!')).resolves.toBeTruthy();
  });
});
