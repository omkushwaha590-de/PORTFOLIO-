import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import type { z } from 'zod';
import { Project } from '../models/project.model';
import { AppError } from '../utils/app-error';
import { paginated, toSkip } from '../utils/pagination';
import type { adminProjectListQuery, publicProjectListQuery } from '../validators/project.schema';
import { createContentCrud } from './content-crud.factory';

const CARD_FIELDS = 'title slug shortDescription category technologies thumbnail featured order year client results';
const caseInsensitive = { locale: 'en', strength: 2 } as const;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const crud = createContentCrud({ model: Project, label: 'Project', slugFrom: 'title', publicListFields: CARD_FIELDS });

export const projectsController = {
  ...crud,

  /** GET /projects?category=AI&featured=true — published projects, card fields only. */
  async publicList(req: Request, res: Response) {
    const query = req.validatedQuery as z.infer<typeof publicProjectListQuery>;
    const filter: Record<string, unknown> = { status: 'published' };
    if (query.category && query.category.toLowerCase() !== 'all') filter.category = query.category;
    if (query.featured !== undefined) filter.featured = query.featured;

    const [items, total] = await Promise.all([
      Project.find(filter)
        .select(CARD_FIELDS)
        .collation(caseInsensitive)
        .sort({ order: 1, createdAt: -1 })
        .skip(toSkip(query))
        .limit(query.limit),
      Project.countDocuments(filter).collation(caseInsensitive),
    ]);
    const page = paginated(items, total, query);
    res.json({ data: page.items, meta: { page: page.page, limit: page.limit, total: page.total, totalPages: page.totalPages } });
  },

  /** GET /projects/:slug — full case study plus previous/next links for navigation. */
  async publicGetBySlug(req: Request, res: Response) {
    const project = await Project.findOne({ slug: String(req.params.slug).toLowerCase(), status: 'published' });
    if (!project) throw AppError.notFound('Project not found');

    const siblings = await Project.find({ status: 'published' }).select('title slug').sort({ order: 1, createdAt: -1 }).lean();
    const index = siblings.findIndex((item) => item.slug === project.slug);
    const link = (item: (typeof siblings)[number] | undefined) => (item ? { title: item.title, slug: item.slug } : null);

    res.json({
      data: project,
      meta: { previous: link(siblings[index - 1]), next: link(siblings[index + 1]) },
    });
  },

  /** Admin list with status/category filters and title search. */
  async adminList(req: Request, res: Response) {
    const query = req.validatedQuery as z.infer<typeof adminProjectListQuery>;
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.search) filter.title = mongoose.trusted({ $regex: escapeRegex(query.search), $options: 'i' });

    const [items, total] = await Promise.all([
      Project.find(filter).sort({ order: 1, createdAt: -1 }).skip(toSkip(query)).limit(query.limit),
      Project.countDocuments(filter),
    ]);
    const page = paginated(items, total, query);
    res.json({ data: page.items, meta: { page: page.page, limit: page.limit, total: page.total, totalPages: page.totalPages } });
  },
};
