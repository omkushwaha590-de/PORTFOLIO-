import { Router } from 'express';
import { projectsController } from '../controllers/projects.controller';
import {
  experienceController,
  servicesController,
  skillsController,
  testimonialsController,
} from '../controllers/content.controllers';
import { readSettings } from '../controllers/settings.controller';
import { submitContact, submitQuote } from '../controllers/submissions.controller';
import { formLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validate';
import { slugParams } from '../validators/common';
import { publicProjectListQuery } from '../validators/project.schema';
import { contactBody, quoteBody } from '../validators/submission.schema';

export const publicRouter = Router();

publicRouter.get('/settings', readSettings);

publicRouter.get('/projects', validate({ query: publicProjectListQuery }), projectsController.publicList);
publicRouter.get('/projects/:slug', validate({ params: slugParams }), projectsController.publicGetBySlug);

publicRouter.get('/services', servicesController.publicList);
publicRouter.get('/services/:slug', validate({ params: slugParams }), servicesController.publicGetBySlug);

publicRouter.get('/testimonials', testimonialsController.publicList);
publicRouter.get('/skills', skillsController.publicList);
publicRouter.get('/experience', experienceController.publicList);

publicRouter.post('/contact', formLimiter, validate({ body: contactBody }), submitContact);
publicRouter.post('/quotes', formLimiter, validate({ body: quoteBody }), submitQuote);
