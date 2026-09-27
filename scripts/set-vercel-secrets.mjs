#!/usr/bin/env node
/**
 * Generates the two server secrets and stores them on both Vercel projects as "sensitive"
 * environment variables (write-only: they cannot be read back, even in the dashboard).
 * The values are never printed.
 *
 *   node scripts/set-vercel-secrets.mjs          set / rotate JWT_SECRET and INTERNAL_API_KEY
 *   node scripts/set-vercel-secrets.mjs --check  verify access with a harmless test variable
 *   node scripts/set-vercel-secrets.mjs --admin  set the first admin login (asked for, password hidden)
 *   node scripts/set-vercel-secrets.mjs --reset-login
 *                                                forgot the password? set a new one (and optionally a new email)
 *   node scripts/set-vercel-secrets.mjs --remove-admin-seed
 *                                                delete stored admin/reset passwords after signing in
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
  // DELETE is only used for this script's own variables (SETUP_CHECK, ADMIN_SEED_*/ADMIN_RESET_*).
  if (method === 'DELETE') args.push('--dangerously-skip-permissions');
  let file;
  if (body) {
    file = path.join(workDir, `${randomBytes(6).toString('hex')}.json`);
    writeFileSync(file, JSON.stringify(body), { mode: 0o600 });
    args.push('--input', file);
  }
  // On Windows the command runs through cmd.exe, where characters such as & in the API query string
  // would split the command; quote every argument so it is passed through unchanged.
  const shellArgs = process.platform === 'win32' ? args.map((arg) => `"${arg.replace(/"/g, '""')}"`) : args;
  const result = spawnSync('npx', shellArgs, {
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
 * Terminal questions. In a real terminal each answer is read directly; passwords show one * per
 * character (Backspace works, Ctrl+C cancels). When input is piped, lines are queued instead so no
 * answer is lost.
 */
let pipedPrompt;
const pipedLines = [];
const pipedWaiting = [];

function askPiped(question, hidden) {
  if (!pipedPrompt) {
    pipedPrompt = readline.createInterface({ input: process.stdin, terminal: false });
    pipedPrompt.on('line', (line) => (pipedWaiting.length ? pipedWaiting.shift()(line) : pipedLines.push(line)));
    pipedPrompt.on('close', () => pipedWaiting.splice(0).forEach((resolve) => resolve('')));
  }
  process.stdout.write(question);
  return new Promise((resolve) => {
    const done = (answer) => {
      process.stdout.write(hidden ? '\n' : `${answer}\n`);
      resolve(answer);
    };
    if (pipedLines.length) done(pipedLines.shift());
    else pipedWaiting.push(done);
  });
}

function askVisible(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function askMasked(question) {
  return new Promise((resolve) => {
    const input = process.stdin;
    let value = '';
    process.stdout.write(question);
    input.setRawMode(true);
    input.resume();
    input.setEncoding('utf8');
    const finish = () => {
      input.setRawMode(false);
      input.pause();
      input.removeListener('data', onData);
      process.stdout.write('\n');
      resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') return finish();
        if (char === '\u0003') {
          input.setRawMode(false);
          process.stdout.write('\nCancelled. Nothing was saved.\n');
          process.exit(130);
        }
        if (char === '\u007f' || char === '\b') {
          if (value.length) {
            value = value.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else if (char >= ' ') {
          value += char;
          process.stdout.write('*');
        }
      }
    };
    input.on('data', onData);
  });
}

function ask(question, { hidden = false } = {}) {
  if (!process.stdin.isTTY) return askPiped(question, hidden);
  return hidden ? askMasked(question) : askVisible(question);
}

function passwordProblem(password) {
  if (password.length < 12) return 'at least 12 characters';
  if (!/[a-z]/.test(password)) return 'a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'an uppercase letter';
  if (!/\d/.test(password)) return 'a number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'a symbol';
  return null;
}

async function askNewPassword() {
  const password = await ask('Password: ', { hidden: true });
  const problem = passwordProblem(password);
  if (problem) throw new Error(`Password needs ${problem}. Nothing was saved.`);
  const again = await ask('Repeat password: ', { hidden: true });
  if (again !== password) throw new Error('Passwords do not match. Nothing was saved.');
  return password;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function deleteVariables(project, keys) {
  const { envs = [] } = vercelApi('GET', `/v10/projects/${project}/env`);
  const matches = envs.filter((item) => keys.includes(item.key));
  for (const env of matches) vercelApi('DELETE', `/v9/projects/${project}/env/${env.id}`);
  return matches.map((env) => env.key);
}

/** Redeploys the latest production build of the API so new environment values take effect. */
function redeployApi() {
  const { deployments = [] } = vercelApi('GET', `/v6/deployments?projectId=${API_PROJECT}&target=production&state=READY&limit=1`);
  const latest = deployments[0];
  if (!latest) {
    console.log('No production deployment found yet: push to GitHub or redeploy the API in Vercel.');
    return;
  }
  vercelApi('POST', '/v13/deployments?forceNew=1', { name: API_PROJECT, deploymentId: latest.uid, target: 'production' });
  console.log('  ✓ API redeploy started (ready in about a minute)');
}

async function setAdminSeed() {
  console.log('First admin login for the website dashboard (/admin).');
  const email = (await ask('Admin email: ')).trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new Error('That does not look like an email address.');
  const password = await askNewPassword();
  setVariable(API_PROJECT, 'ADMIN_SEED_EMAIL', email, 'plain');
  setVariable(API_PROJECT, 'ADMIN_SEED_PASSWORD', password);
  redeployApi();
  console.log('Done. After the redeploy, sign in at /admin. Then run with --remove-admin-seed.');
}

async function resetLogin() {
  console.log('Reset the admin login. Leave the email empty to keep the current one.');
  const email = (await ask('New login email (optional): ')).trim().toLowerCase();
  if (email && !EMAIL_PATTERN.test(email)) throw new Error('That does not look like an email address.');
  const password = await askNewPassword();
  if (email) setVariable(API_PROJECT, 'ADMIN_RESET_EMAIL', email, 'plain');
  else deleteVariables(API_PROJECT, ['ADMIN_RESET_EMAIL']);
  setVariable(API_PROJECT, 'ADMIN_RESET_PASSWORD', password);
  // A fresh id makes the API apply this reset exactly once.
  setVariable(API_PROJECT, 'ADMIN_RESET_ID', `reset-${Date.now()}-${randomBytes(4).toString('hex')}`, 'plain');
  redeployApi();
  console.log('Done. After the redeploy, sign in with the new details. Then run with --remove-admin-seed.');
}

function removeAdminSeed() {
  const removed = deleteVariables(API_PROJECT, ['ADMIN_SEED_PASSWORD', 'ADMIN_RESET_PASSWORD']);
  console.log(removed.length ? `  ✓ removed: ${removed.join(', ')}` : 'No stored admin passwords were found.');
}

try {
  if (process.argv.includes('--admin')) {
    await setAdminSeed();
  } else if (process.argv.includes('--reset-login')) {
    await resetLogin();
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
  pipedPrompt?.close();
  rmSync(workDir, { recursive: true, force: true });
}
