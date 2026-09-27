# Portfolio Backend

Express 5 + TypeScript + MongoDB (Mongoose) + Zod. Serves all portfolio content, receives contact/quotation
submissions, and powers the admin dashboard.

## Setup

```bash
npm install
cp .env.example .env          # then fill in the values
npm run seed:admin            # creates the admin from ADMIN_SEED_* (then delete ADMIN_SEED_PASSWORD from .env)
npm run dev                   # http://localhost:4000/api/v1
```

| Script | Purpose |
|---|---|
| `npm run dev` | Watch mode with pretty logs |
| `npm run build` / `npm start` | Compile to `dist/` and run in production |
| `npm test` | Integration tests against an in-memory MongoDB |
| `npm run typecheck` | Strict TypeScript check |
| `npm run seed:admin [-- --reset]` | Create the admin, or reset its password |

## Structure

```
src/
├── config/        env (Zod-validated), db, cors, logger
├── models/        Mongoose schemas (Project, Service, Testimonial, Skill, Message, Quote, Admin, Settings)
├── validators/    Zod request schemas
├── middleware/    auth, validate, rate-limit, origin-check, error-handler
├── services/      auth, email (Resend), turnstile, storage + file-signature checks
├── controllers/   request handlers (content types share content-crud.factory.ts)
├── routes/        public, auth, admin
├── scripts/       seed-admin
├── app.ts         Express app (middleware order lives here)
└── server.ts      entry point
tests/             Vitest + Supertest integration tests
```

## API (`/api/v1`)

Responses are `{ data, meta? }` on success and `{ error: { code, message, details? } }` on failure.

**Public**

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | DB status |
| GET | `/settings` | Site config and form options |
| GET | `/projects?category=&featured=&page=&limit=` | Published cards only |
| GET | `/projects/:slug` | Full case study; `meta.previous` / `meta.next` |
| GET | `/services`, `/services/:slug` | |
| GET | `/testimonials`, `/skills` | |
| POST | `/contact` | Rate-limited, Turnstile, honeypot `website` |
| POST | `/quotes` | Same protections; options checked against settings |

**Auth**: `POST /auth/login`, `POST /auth/logout` (`{ everywhere: true }` revokes all sessions),
`GET /auth/me`, `POST /auth/change-password`.

**Admin** (all require a session): `GET /admin/dashboard`;
`GET|POST /admin/{projects|services|testimonials|skills}`, `GET|PATCH|DELETE /admin/{…}/:id`,
`PATCH /admin/{…}/reorder` with `{ ids: [...] }`. Publish, unpublish and feature changes are
`PATCH` requests with `{ status }` or `{ featured }`.
`GET /admin/{messages|quotes}?status=`, `GET|PATCH|DELETE /admin/{messages|quotes}/:id`;
`GET|PUT /admin/settings`; `POST /admin/uploads` (multipart field `file`).

## Security summary

- **Auth:** bcrypt (cost 12). JWT in an `httpOnly` + `Secure` (in production) + `SameSite` cookie, with a `__Host-` prefix in production. Sessions expire (`JWT_EXPIRES_IN`) and each token is checked against the database, so a password change or "logout everywhere" revokes it immediately.
- **Brute force:** per-account lockout (`LOGIN_MAX_ATTEMPTS` / `LOGIN_LOCK_MINUTES`) plus IP rate limits on login, forms and the whole API.
- **Authorization:** `requireAuth` runs on the server for every `/admin` route. There is no public sign-up.
- **Input validation:** every body, query and param goes through a Zod schema. Unknown fields are rejected, URLs must be `http(s)`, and Mongoose `sanitizeFilter` blocks operator injection.
- **CSRF:** SameSite cookies, a CORS allow-list (no `*`), and an Origin check on state-changing requests.
- **Headers:** Helmet sets a locked-down CSP, HSTS (in production), `nosniff`, `Referrer-Policy` and `Permissions-Policy`.
- **Uploads:** memory-only, size-capped, type detected from magic bytes (JPEG/PNG/WebP/GIF/AVIF, no SVG), stored under random UUID names.
- **Secrets:** only in `.env`, which is git-ignored. The app refuses to start with a missing or weak `JWT_SECRET`.
- **Output:** content is stored as plain text. The frontend must render it as text or safe Markdown, never with `dangerouslySetInnerHTML`.

## Deployment notes

- Recommended: the Next.js app proxies `/api/*` to this server (rewrites), which keeps the cookie first-party with `COOKIE_SAMESITE=lax`.
- Set `TRUST_PROXY=1` behind Render/Railway so rate limits see real client IPs.
- Use `STORAGE_DRIVER=cloudinary` in production; local disk on most hosts is ephemeral.
- Atlas: create a database user with `readWrite` on this database only, restrict network access, and enable backups.
