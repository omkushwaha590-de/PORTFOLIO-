import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { isProduction } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/app-error';

export const notFound: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
};

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

function normalize(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    return new AppError(400, 'Validation failed', 'VALIDATION_ERROR', details);
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return new AppError(413, 'File is too large', 'FILE_TOO_LARGE');
    return AppError.badRequest(err.message);
  }

  if (err instanceof mongoose.Error.CastError) return AppError.badRequest('Invalid identifier');
  if (err instanceof mongoose.Error.ValidationError) return AppError.badRequest('Invalid data');

  const maybe = err as { code?: number; type?: string; status?: number; keyValue?: Record<string, unknown> };
  if (maybe?.code === 11000) {
    const field = Object.keys(maybe.keyValue ?? {})[0] ?? 'field';
    return AppError.conflict(`A record with this ${field} already exists`);
  }
  // body-parser errors
  if (maybe?.type === 'entity.too.large') return new AppError(413, 'Request body is too large', 'PAYLOAD_TOO_LARGE');
  if (maybe?.type === 'entity.parse.failed') return AppError.badRequest('Malformed JSON');

  return new AppError(500, 'Something went wrong', 'INTERNAL_ERROR');
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = normalize(err);

  if (appError.statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  }

  const body: ErrorBody = { error: { code: appError.code, message: appError.message } };
  if (appError.details !== undefined) body.error.details = appError.details;
  // Never leak stack traces or internal messages in production.
  if (!isProduction && appError.statusCode >= 500 && err instanceof Error) {
    body.error.details = { message: err.message };
  }

  res.status(appError.statusCode).json(body);
};
