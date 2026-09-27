# Deployment on Vercel

The portfolio is **two separate Vercel projects** built from this one repository:

| Project | Root directory | What it is | Example URL |
|---|---|---|---|
| **Website** | `frontend` | Next.js site + admin dashboard | `https://yogesh-portfolio.vercel.app` → later your domain |
| **API** | `backend` | Express API (runs as a Vercel Function) | `https://yogesh-portfolio-api.vercel.app` |

Visitors only ever use the **Website** URL. The website relays `/api/v1/*` to the API, so the admin login
cookie stays on your own domain. Everything is managed from Vercel:

- **Database**: MongoDB Atlas, added from the Vercel Marketplace (billed and managed inside Vercel)
- **Image uploads**: Vercel Blob
- **Continuous deployment**: every push to `main` on GitHub redeploys both projects automatically

---

## 1. Create the API project (`backend`)

1. Vercel → **Add New… → Project** → import this GitHub repository.
2. **Root Directory**: `backend`. Framework preset: **Express** (auto-detected). Leave build settings as default.
3. Before deploying, open **Storage** (in the project) and add:
   - **MongoDB Atlas** (Marketplace) → create a free cluster → connect it to this project.
     This adds `MONGODB_URI` automatically.
   - **Blob** → create a store → connect it to this project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. **Settings → Environment Variables** (Production):

| Name | Value |
|---|---|
| `JWT_SECRET` | a long random string (see "Generating secrets" below) |
| `INTERNAL_API_KEY` | a long random string, **the same value** as on the Website project |
| `CORS_ORIGINS` | the Website URL(s), comma-separated, e.g. `https://yogesh-portfolio.vercel.app,https://www.yourdomain.com` |
| `STORAGE_DRIVER` | `vercel-blob` |
| `TRUST_PROXY` | `1` |
| `COOKIE_SAMESITE` | `lax` |
| `PUBLIC_API_URL` | the API URL, e.g. `https://yogesh-portfolio-api.vercel.app` |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` | optional: email notifications for new messages (https://resend.com) |
| `TURNSTILE_SECRET_KEY` | optional: Cloudflare Turnstile bot protection (set together with the Website's site key) |

5. Deploy. Check `https://<api-url>/api/v1/health` → `{"data":{"status":"ok","database":true}}`.

## 2. Create the Website project (`frontend`)

1. Vercel → **Add New… → Project** → import the **same** repository again.
2. **Root Directory**: `frontend`. Framework preset: **Next.js** (auto-detected).
3. **Environment Variables** (Production):

| Name | Value |
|---|---|
| `BACKEND_URL` | the API URL from step 1, e.g. `https://yogesh-portfolio-api.vercel.app` |
| `INTERNAL_API_KEY` | the same value as on the API project |
| `NEXT_PUBLIC_SITE_URL` | the Website URL (your custom domain once added) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | optional (Turnstile site key) |

4. Deploy, then open the Website URL.

> After the Website has its final URL, make sure it is listed in the API's `CORS_ORIGINS` and redeploy the API.

## 3. Content and the first admin login (automatic)

On its first start against an empty database the API loads the starter profile content by itself
(`backend/src/scripts/bootstrap.ts`). It never does this again once a profile exists, so anything you
delete in the admin stays deleted.

To create the first admin login, run this from the project folder and answer the questions (the
password is hidden while you type). It saves the details to the API project and redeploys it:

```bash
node scripts/set-vercel-secrets.mjs --admin
```

About a minute later, sign in at `https://<website>/admin`. Then remove the stored password:

```bash
node scripts/set-vercel-secrets.mjs --remove-admin-seed
```

### Changing the login later

- **Email or password**: sign in → **Account** → *Change login email* / *Change password*. Both need
  your current password and sign out your other devices.
- **Forgot the password**: run `node scripts/set-vercel-secrets.mjs --reset-login`, enter a new password
  (and optionally a new email). The API redeploys and applies the reset exactly once; a password you
  change later in the dashboard is never overwritten. Afterwards run `--remove-admin-seed` again.
  This only works for someone with access to the Vercel account.

The two server secrets (`JWT_SECRET`, `INTERNAL_API_KEY`) are set with
`node scripts/set-vercel-secrets.mjs` (run again any time to rotate them, then redeploy both projects).

## 4. Custom domain

Website project → **Settings → Domains** → add `yourdomain.com` (and `www.yourdomain.com`).
Vercel shows the DNS records to add at your domain registrar. Then:

- update `NEXT_PUBLIC_SITE_URL` on the Website project,
- add the domain to `CORS_ORIGINS` on the API project,
- redeploy both.

## 5. Updating the site

- **Content** (projects, text, photo, settings): use the admin dashboard at `/admin`. No redeploy needed.
- **Code**: push to `main` on GitHub. Both projects redeploy automatically; every pull request gets its
  own preview URL.
- **Secrets / settings**: change them in each project's **Settings → Environment Variables**, then redeploy
  that project.

## Handing the projects over

Vercel → project → **Settings → General → Transfer Project** moves a project (with its domains and
environment variables) to another Vercel account or team. Transfer both projects and the GitHub
repository (GitHub → repository → Settings → Transfer ownership).

## Generating secrets

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Use a different value for `JWT_SECRET` and `INTERNAL_API_KEY`. Never commit them or paste them into chat.

## Notes and limits

- Rate limiting uses per-instance memory. On serverless it is a best-effort layer; login protection
  also relies on the per-account lockout stored in the database, which holds across instances.
- Uploaded images are validated (type by file signature, 5 MB max) and stored in Vercel Blob.
- The `backend` project also runs anywhere Node.js runs: `npm run build && npm start` (see `src/start.ts`).
