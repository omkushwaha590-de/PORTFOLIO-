import type { Request, Response } from 'express';
import { Message } from '../models/message.model';
import { Project } from '../models/project.model';
import { Quote } from '../models/quote.model';
import { Service } from '../models/service.model';
import { Skill } from '../models/skill.model';
import { Testimonial } from '../models/testimonial.model';

/** GET /admin/dashboard — counts and the latest inbox items. */
export async function getDashboard(_req: Request, res: Response) {
  const [projects, publishedProjects, services, testimonials, skills, newMessages, newQuotes, recentMessages, recentQuotes] =
    await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'published' }),
      Service.countDocuments(),
      Testimonial.countDocuments(),
      Skill.countDocuments(),
      Message.countDocuments({ status: 'new' }),
      Quote.countDocuments({ status: 'new' }),
      Message.find().sort({ createdAt: -1 }).limit(5).select('name email company status createdAt'),
      Quote.find().sort({ createdAt: -1 }).limit(5).select('name email projectType budget status createdAt'),
    ]);

  res.json({
    data: {
      counts: { projects, publishedProjects, services, testimonials, skills, newMessages, newQuotes },
      recentMessages,
      recentQuotes,
    },
  });
}
