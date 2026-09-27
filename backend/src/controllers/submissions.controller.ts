import type { Request, Response } from 'express';
import type { Model } from 'mongoose';
import type { z } from 'zod';
import { Message } from '../models/message.model';
import { Quote } from '../models/quote.model';
import { getSettings } from '../models/settings.model';
import { notifyAdmin } from '../services/email.service';
import { verifyTurnstile } from '../services/turnstile.service';
import { AppError } from '../utils/app-error';
import { clientIp } from '../middleware/client-ip';
import { paginated, toSkip } from '../utils/pagination';
import type { contactBody, messageListQuery, quoteBody } from '../validators/submission.schema';

const RECEIVED = { data: { received: true } };

function assertOption(value: string, options: string[], field: string) {
  if (value && !options.includes(value)) {
    throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', [{ path: field, message: 'Choose one of the listed options' }]);
  }
}

/** POST /contact */
export async function submitContact(req: Request, res: Response) {
  const { turnstileToken, website, ...input } = req.body as z.infer<typeof contactBody>;

  // Honeypot filled → silently accept without storing, so bots get no signal.
  if (website) return res.status(201).json(RECEIVED);

  await verifyTurnstile(turnstileToken, clientIp(req));

  const settings = await getSettings();
  assertOption(input.projectType, settings.projectTypes, 'projectType');
  assertOption(input.budget, settings.budgetOptions, 'budget');

  const message = await Message.create(input);

  void notifyAdmin(
    `New contact message from ${input.name}`,
    [
      { label: 'Name', value: input.name },
      { label: 'Email', value: input.email },
      { label: 'Phone', value: input.phone },
      { label: 'Company', value: input.company },
      { label: 'Project type', value: input.projectType },
      { label: 'Budget', value: input.budget },
      { label: 'Message', value: input.message },
    ],
    input.email,
  );

  res.status(201).json({ data: { received: true, id: String(message._id) } });
}

/** POST /quotes */
export async function submitQuote(req: Request, res: Response) {
  const { turnstileToken, website, ...input } = req.body as z.infer<typeof quoteBody>;

  if (website) return res.status(201).json(RECEIVED);

  await verifyTurnstile(turnstileToken, clientIp(req));

  const settings = await getSettings();
  assertOption(input.projectType, settings.projectTypes, 'projectType');
  assertOption(input.budget, settings.budgetOptions, 'budget');
  assertOption(input.timeline, settings.timelineOptions, 'timeline');

  const quote = await Quote.create(input);

  void notifyAdmin(
    `New project quotation request from ${input.name}`,
    [
      { label: 'Name', value: input.name },
      { label: 'Email', value: input.email },
      { label: 'Company', value: input.company },
      { label: 'Project type', value: input.projectType },
      { label: 'Budget', value: input.budget },
      { label: 'Timeline', value: input.timeline },
      { label: 'Description', value: input.description },
      { label: 'Required features', value: input.requirements },
    ],
    input.email,
  );

  res.status(201).json({ data: { received: true, id: String(quote._id) } });
}

/** Admin inbox handlers shared by messages and quotations. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared across the two inbox models
function createInboxController(model: Model<any>, label: string) {
  return {
    async list(req: Request, res: Response) {
      const query = req.validatedQuery as z.infer<typeof messageListQuery>;
      const filter = query.status ? { status: query.status } : {};
      const [items, total] = await Promise.all([
        model.find(filter).sort({ createdAt: -1 }).skip(toSkip(query)).limit(query.limit),
        model.countDocuments(filter),
      ]);
      const page = paginated(items, total, query);
      res.json({ data: page.items, meta: { page: page.page, limit: page.limit, total: page.total, totalPages: page.totalPages } });
    },

    async get(req: Request, res: Response) {
      const item = await model.findById(req.params.id);
      if (!item) throw AppError.notFound(`${label} not found`);
      res.json({ data: item });
    },

    async update(req: Request, res: Response) {
      const item = await model.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
      if (!item) throw AppError.notFound(`${label} not found`);
      res.json({ data: item });
    },

    async remove(req: Request, res: Response) {
      const item = await model.findByIdAndDelete(req.params.id);
      if (!item) throw AppError.notFound(`${label} not found`);
      res.status(204).end();
    },
  };
}

export const messagesController = createInboxController(Message, 'Message');
export const quotesController = createInboxController(Quote, 'Quotation');
