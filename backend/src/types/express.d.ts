import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    /** Set by `requireAuth` after the session token has been verified against the database. */
    admin?: { id: string; email: string; role: 'admin' };
    /** Parsed and validated query string (Express 5 makes `req.query` read-only). */
    validatedQuery?: unknown;
  }
}
