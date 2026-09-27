import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import type { ZodTypeAny } from 'zod';
import { env } from '../config/env';
import { adminListQuery } from '../controllers/content-crud.factory';
import {
  experienceController,
  servicesController,
  skillsController,
  testimonialsController,
} from '../controllers/content.controllers';
import { getDashboard } from '../controllers/dashboard.controller';
import { projectsController } from '../controllers/projects.controller';
import { readSettings, updateSettings } from '../controllers/settings.controller';
import { messagesController, quotesController } from '../controllers/submissions.controller';
import { uploadImage } from '../controllers/uploads.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParams, reorderBody } from '../validators/common';
import { experienceCreateBody, experienceUpdateBody } from '../validators/experience.schema';
import { adminProjectListQuery, projectCreateBody, projectUpdateBody } from '../validators/project.schema';
import { serviceCreateBody, serviceUpdateBody } from '../validators/service.schema';
import { settingsUpdateBody } from '../validators/settings.schema';
import { skillCreateBody, skillUpdateBody } from '../validators/skill.schema';
import {
  messageListQuery,
  messageUpdateBody,
  quoteListQuery,
  quoteUpdateBody,
} from '../validators/submission.schema';
import { testimonialCreateBody, testimonialUpdateBody } from '../validators/testimonial.schema';

export const adminRouter = Router();

// Every route below requires a valid, non-revoked admin session — enforced on the server.
adminRouter.use(requireAuth);

adminRouter.get('/dashboard', getDashboard);

interface ContentHandlers {
  adminList: RequestHandler;
  adminGet: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
  reorder: RequestHandler;
}

function mountContent(
  path: string,
  controller: ContentHandlers,
  schemas: { create: ZodTypeAny; update: ZodTypeAny; list?: ZodTypeAny },
) {
  adminRouter.get(path, validate({ query: schemas.list ?? adminListQuery }), controller.adminList);
  adminRouter.patch(`${path}/reorder`, validate({ body: reorderBody }), controller.reorder);
  adminRouter.get(`${path}/:id`, validate({ params: idParams }), controller.adminGet);
  adminRouter.post(path, validate({ body: schemas.create }), controller.create);
  adminRouter.patch(`${path}/:id`, validate({ params: idParams, body: schemas.update }), controller.update);
  adminRouter.delete(`${path}/:id`, validate({ params: idParams }), controller.remove);
}

mountContent('/projects', projectsController, { create: projectCreateBody, update: projectUpdateBody, list: adminProjectListQuery });
mountContent('/services', servicesController, { create: serviceCreateBody, update: serviceUpdateBody });
mountContent('/testimonials', testimonialsController, { create: testimonialCreateBody, update: testimonialUpdateBody });
mountContent('/skills', skillsController, { create: skillCreateBody, update: skillUpdateBody });
mountContent('/experience', experienceController, { create: experienceCreateBody, update: experienceUpdateBody });

// Inbox: contact messages and quotation requests
adminRouter.get('/messages', validate({ query: messageListQuery }), messagesController.list);
adminRouter.get('/messages/:id', validate({ params: idParams }), messagesController.get);
adminRouter.patch('/messages/:id', validate({ params: idParams, body: messageUpdateBody }), messagesController.update);
adminRouter.delete('/messages/:id', validate({ params: idParams }), messagesController.remove);

adminRouter.get('/quotes', validate({ query: quoteListQuery }), quotesController.list);
adminRouter.get('/quotes/:id', validate({ params: idParams }), quotesController.get);
adminRouter.patch('/quotes/:id', validate({ params: idParams, body: quoteUpdateBody }), quotesController.update);
adminRouter.delete('/quotes/:id', validate({ params: idParams }), quotesController.remove);

adminRouter.get('/settings', readSettings);
adminRouter.put('/settings', validate({ body: settingsUpdateBody }), updateSettings);

// Uploads: memory storage + size cap here; real type check by magic bytes in the storage service.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1, fields: 5, parts: 6 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml'),
});
adminRouter.post('/uploads', upload.single('file'), uploadImage);
