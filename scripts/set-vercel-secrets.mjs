#!/usr/bin/env node
/**
 * Generates the two server secrets and stores them on both Vercel projects as "sensitive"
 * environment variables (write-only: they cannot be read back, even in the dashboard).
 * The values are never printed.
 *
 *   node scripts/set-vercel-secrets.mjs          set / rotate JWT_SECRET and INTERNAL_API_KEY
 *   node scripts/set-vercel-secrets.mjs --check  verify access with a harmless test variable
 *   node scripts/set-vercel-secrets.mjs --admin  set the first admin login (asked for, password hidden)
 *   node scripts/set-vercel-secrets.mjs --remove-admin-seed
 *                                                delete the stored admin password after first sign-in
 *
 * Requires the Vercel CLI to be logged in (`npx vercel login`). Rotating JWT_SECRET signs out
 * every admin session; redeploy both projects afterwards.
 */
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const API_PROJECT = process.env.VERCEL_API_PROJECT ?? 'yogesh-portfolio-api';
const WEB_PROJECT = process.env.VERCEL_WEB_PROJECT ?? 'yogesh-portfolio';
const TARGETS = ['production', 'preview'];

const secret = () => randomBytes(48).toString('base64url');
const workDir = mkdtempSync(path.join(tmpdir(), 'vercel-secrets-'));

function vercelApi(method, endpoint, body) {
  const args = ['--yes', 'vercel', 'api', endpoint, '-X', method, '--raw'];
  // DELETE is only used for this script's own variables (SETUP_CHECK, ADMIN_SEED_PASSWORD).
  if (method === 'DELETE') args.push('--dangerously-skip-permissions');
  let file;
  if (body) {
    file = path.join(workDir, `${randomBytes(6).toString('hex')}.json`);
    writeFileSync(file, JSON.stringify(body), { mode: 0o600 });
    args.push('--input', file);
  }
  const result = spawnSync('npx', args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, MSYS_NO_PATHCONV: '1', VERCEL_TELEMETRY_DISABLED: '1' },
  });
  if (file) rmSync(file, { force: true }); // never leave a secret on disk
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  // The CLI may print banners, notices or hints around the JSON body; parse only the outermost object.
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  let json = null;
  try {
    json = start >= 0 && end > start ? JSON.parse(output.slice(start, end + 1)) : null;
  } catch {
    // not JSON
  }

  if (result.status !== 0 || !json || json.error) {
    // Drop CLI notices ("> NOTE: ...") and hints so the actual error is shown.
    const details = output
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.startsWith('>') && !line.includes('claude-code-hint'))
      .join(' ')
      .slice(0, 400);
    const message = json?.error?.message ?? `exit code ${result.status}: ${details}`;
    throw new Error(`${method} ${endpoint} failed: ${message}`);
  }
  return json;
}

function setVariable(project, key, value, type = 'sensitive') {
  vercelApi('POST', `/v10/projects/${project}/env?upsert=true`, { key, value, type, target: TARGETS });
  console.log(`  ✓ ${project}: ${key}`);
}

/**
 * Line-based prompt shared by all questions. Incoming lines are queued, so answers are never lost
 * (even when input is pasted or piped). With `hidden`, typed characters are not echoed.
 */
let prompt;
let muted = false;
const lines = [];
const waiting = [];
function ask(question, { hidden = false } = {}) {
  if (!prompt) {
    prompt = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: Boolean(process.stdin.isTTY) });
    const write = prompt._writeToOutput?.bind(prompt);
    prompt._writeToOutput = (text) => {
      if (!muted || text === '\r\n' || text === '\n') (write ?? ((t) => process.stdout.write(t)))(text);
    };
    prompt.on('line', (line) => (waiting.length ? waiting.shift()(line) : lines.push(line)));
    prompt.on('close', () => waiting.splice(0).forEach((resolve) => resolve('')));
  }
  process.stdout.write(question);
  muted = hidden;
  return new Promise((resolve) => {
    const done = (answer) => {
      muted = false;
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    };
    if (lines.length) done(lines.shift());
    else waiting.push(done);
  });
}

function passwordProblem(password) {
  if (password.length < 12) return 'at least 12 characters';
  if (!/[a-z]/.test(password)) return 'a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'an uppercase letter';
  if (!/\d/.test(password)) return 'a number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'a symbol';
  return null;
}

async function setAdminSeed() {
  console.log('First admin login for the website dashboard (/admin).');
  const email = (await ask('Admin email: ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('That does not look like an email address.');
  const password = await ask('Password (hidden): ', { hidden: true });
  const problem = passwordProblem(password);
  if (problem) throw new Error(`Password needs ${problem}. Nothing was saved.`);
  const again = await ask('Repeat password (hidden): ', { hidden: true });
  if (again !== password) throw new Error('Passwords do not match. Nothing was saved.');
  setVariable(API_PROJECT, 'ADMIN_SEED_EMAIL', email, 'plain');
  setVariable(API_PROJECT, 'ADMIN_SEED_PASSWORD', password);
  console.log('Saved. The API creates this admin on its next deployment (only if no admin exists yet).');
}

function removeAdminSeed() {
  const { envs = [] } = vercelApi('GET', `/v10/projects/${API_PROJECT}/env`);
  const matches = envs.filter((item) => item.key === 'ADMIN_SEED_PASSWORD');
  for (const env of matches) vercelApi('DELETE', `/v9/projects/${API_PROJECT}/env/${env.id}`);
  console.log(matches.length ? '  ✓ ADMIN_SEED_PASSWORD removed' : 'ADMIN_SEED_PASSWORD was not set.');
}

try {
  if (process.argv.includes('--admin')) {
    await setAdminSeed();
  } else if (process.argv.includes('--remove-admin-seed')) {
    removeAdminSeed();
  } else if (process.argv.includes('--check')) {
    console.log('Checking access to both projects...');
    for (const project of [API_PROJECT, WEB_PROJECT]) {
      setVariable(project, 'SETUP_CHECK', 'ok', 'plain');
      const { envs = [] } = vercelApi('GET', `/v10/projects/${project}/env`);
      for (const env of envs.filter((item) => item.key === 'SETUP_CHECK')) {
        vercelApi('DELETE', `/v9/projects/${project}/env/${env.id}`);
      }
      console.log(`  ✓ ${project}: test variable removed`);
    }
    console.log('Access OK. Run again without --check to set the real secrets.');
  } else {
    const internalKey = secret(); // shared by both projects
    console.log('Setting secrets (values are not shown)...');
    setVariable(API_PROJECT, 'JWT_SECRET', secret());
    setVariable(API_PROJECT, 'INTERNAL_API_KEY', internalKey);
    setVariable(WEB_PROJECT, 'INTERNAL_API_KEY', internalKey);
    console.log('Done. Redeploy both projects for the new values to take effect.');
  }
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
} finally {
  prompt?.close();
  rmSync(workDir, { recursive: true, force: true });
}
