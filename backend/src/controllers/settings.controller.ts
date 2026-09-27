import type { Request, Response } from 'express';
import { Settings, getSettings } from '../models/settings.model';

/** GET /settings (public) and GET /admin/settings */
export async function readSettings(_req: Request, res: Response) {
  res.json({ data: await getSettings() });
}

/** PUT /admin/settings — partial update of site-wide configuration. */
export async function updateSettings(req: Request, res: Response) {
  await getSettings(); // ensure the singleton exists
  const settings = await Settings.findOneAndUpdate({ key: 'site' }, { $set: req.body }, { new: true, runValidators: true });
  res.json({ data: settings });
}
