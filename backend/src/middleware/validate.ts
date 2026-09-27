import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates request input. The parsed body replaces `req.body` (unknown keys already stripped/rejected);
 * the parsed query is stored on `req.validatedQuery`. Zod errors go to the error handler as 400s.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    if (schemas.params) schemas.params.parse(req.params);
    if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
    if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
    next();
  };
}
