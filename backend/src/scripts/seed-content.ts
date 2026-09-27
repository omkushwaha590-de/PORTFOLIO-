/**
 * Loads the starter content from seed-data/profile.ts.
 *   npm run seed:content            only seeds collections that are empty
 *   npm run seed:content -- --force replaces all portfolio content (never touches admins or the inbox)
 */
import { connectDatabase, disconnectDatabase } from '../config/db';
import { env } from '../config/env';
import { Experience } from '../models/experience.model';
import { Project } from '../models/project.model';
import { Service } from '../models/service.model';
import { Settings, getSettings } from '../models/settings.model';
import { Skill } from '../models/skill.model';
import { slugify } from '../utils/slugify';
import * as data from './seed-data/profile';

export async function seedContent({ force = false } = {}) {
  const log: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic over several models
  async function seed(model: any, name: string, docs: Record<string, unknown>[]) {
    if (force) await model.deleteMany({});
    // Exact count: estimatedDocumentCount() reads cached metadata and can be stale right after deleteMany.
    if ((await model.countDocuments()) > 0) {
      log.push(`${name}: skipped (already has data)`);
      return;
    }
    await model.insertMany(docs.map((doc, order) => ({ order, status: 'published', ...doc })));
    log.push(`${name}: ${docs.length} added`);
  }

  await seed(
    Project,
    'Projects',
    data.projects.map((project) => ({ ...project, slug: slugify(project.title) })),
  );
  await seed(
    Service,
    'Services',
    data.services.map((service) => ({ ...service, slug: slugify(service.title) })),
  );
  await seed(Skill, 'Skills', data.skills);
  await seed(Experience, 'Experience', data.experience as unknown as Record<string, unknown>[]);

  const settings = await getSettings();
  if (force || !settings.profile?.name) {
    await Settings.updateOne({ key: 'site' }, { $set: data.settings });
    log.push('Settings: profile applied');
  } else {
    log.push('Settings: skipped (profile already set)');
  }

  return log;
}

// Run directly: `npm run seed:content`
if (require.main === module) {
  (async () => {
    await connectDatabase(env.MONGODB_URI);
    try {
      const log = await seedContent({ force: process.argv.includes('--force') });
      log.forEach((line) => console.log(line));
    } finally {
      await disconnectDatabase();
    }
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
