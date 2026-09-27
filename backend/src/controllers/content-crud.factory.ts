import type { Request, Response } from 'express';
import mongoose, { type Model } from 'mongoose';
import { z } from 'zod';
import { AppError } from '../utils/app-error';
import { paginated, toSkip } from '../utils/pagination';
import { slugify } from '../utils/slugify';
import { paginationQuery, status } from '../validators/common';

export const adminListQuery = paginationQuery.extend({
  status: status.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

interface ContentCrudOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared across differently-typed models
  model: Model<any>;
  label: string;
  /** Field used to auto-generate the slug; omit for models without slugs. */
  slugFrom?: string;
  /** Fields returned by the public list endpoint (keeps payloads small). */
  publicListFields?: string;
}

/**
 * Admin CRUD + reorder + public read handlers for an orderable, publishable content collection.
 * Input is validated by route-level Zod middleware before these handlers run.
 */
export function createContentCrud({ model, label, slugFrom, publicListFields }: ContentCrudOptions) {
  const sort = { order: 1, createdAt: -1 } as const;

  async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || label.toLowerCase();
    let candidate = root;
    // `trusted()` marks server-built operators so the global sanitizeFilter leaves them intact.
    const notSelf = excludeId ? { _id: mongoose.trusted({ $ne: excludeId }) } : {};
    for (let i = 2; await model.exists({ slug: candidate, ...notSelf }); i++) {
      candidate = `${root}-${i}`;
    }
    return candidate;
  }

  return {
    // ---------- public ----------
    async publicList(_req: Request, res: Response) {
      const items = await model
        .find({ status: 'published' })
        .select(publicListFields ?? '')
        .sort(sort);
      res.json({ data: items });
    },

    async publicGetBySlug(req: Request, res: Response) {
      const item = await model.findOne({ slug: String(req.params.slug).toLowerCase(), status: 'published' });
      if (!item) throw AppError.notFound(`${label} not found`);
      res.json({ data: item });
    },

    // ---------- admin ----------
    async adminList(req: Request, res: Response) {
      const query = req.validatedQuery as z.infer<typeof adminListQuery>;
      const filter = query.status ? { status: query.status } : {};
      const [items, total] = await Promise.all([
        model.find(filter).sort(sort).skip(toSkip(query)).limit(query.limit),
        model.countDocuments(filter),
      ]);
      const page = paginated(items, total, query);
      res.json({ data: page.items, meta: { page: page.page, limit: page.limit, total: page.total, totalPages: page.totalPages } });
    },

    async adminGet(req: Request, res: Response) {
      const item = await model.findById(req.params.id);
      if (!item) throw AppError.notFound(`${label} not found`);
      res.json({ data: item });
    },

    async create(req: Request, res: Response) {
      const body = { ...req.body } as Record<string, unknown>;
      if (slugFrom) {
        body.slug = await uniqueSlug(String(body.slug ?? body[slugFrom] ?? ''));
      }
      const item = await model.create(body);
      res.status(201).location(String(item._id)).json({ data: item });
    },

    async update(req: Request, res: Response) {
      const id = String(req.params.id);
      const body = { ...req.body } as Record<string, unknown>;
      if (slugFrom && typeof body.slug === 'string') {
        body.slug = await uniqueSlug(body.slug, id);
      }
      const item = await model.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
      if (!item) throw AppError.notFound(`${label} not found`);
      res.json({ data: item });
    },

    async remove(req: Request, res: Response) {
      const item = await model.findByIdAndDelete(req.params.id);
      if (!item) throw AppError.notFound(`${label} not found`);
      res.status(204).end();
    },

    /** Sets `order` to each id's position in the submitted list. */
    async reorder(req: Request, res: Response) {
      const { ids } = req.body as { ids: string[] };
      if (new Set(ids).size !== ids.length) throw AppError.badRequest('Duplicate ids in reorder list');

      const found = await model.countDocuments({ _id: mongoose.trusted({ $in: ids }) });
      if (found !== ids.length) throw AppError.badRequest('One or more ids do not exist');

      await model.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } })));
      res.json({ data: { updated: ids.length } });
    },
  };
}
