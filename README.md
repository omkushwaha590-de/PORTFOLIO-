# Yogesh N Modi — Portfolio

Personal portfolio with a content-managed backend and admin dashboard.

```
frontend/   Next.js (App Router, TypeScript, Tailwind) — public site + /admin dashboard
backend/    Express + TypeScript + MongoDB (Mongoose) + Zod — REST API
```

## Local development

```bash
# terminal 1 — API with a local MongoDB (no Atlas needed), seeded with the profile content
cd backend && npm install && npm run dev:local

# terminal 2 — website on http://localhost:3000 (admin at /admin)
cd frontend && npm install && npm run dev
```

The local admin login is written to `backend/.dev-admin.txt` on first run (git-ignored).

## Checks

```bash
cd backend && npm run typecheck && npm test
cd frontend && npx tsc --noEmit && npm run lint
```

## Deployment

Two Vercel projects (website and API) from this repository — see [DEPLOYMENT.md](DEPLOYMENT.md).
