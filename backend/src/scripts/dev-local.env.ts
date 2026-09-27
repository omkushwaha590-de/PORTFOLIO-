/**
 * Imported first by dev-local.ts so `config/env` validates against the local database settings.
 * Values already present in the shell environment take precedence over .env (dotenv never overrides).
 */
import { randomBytes } from 'node:crypto';
import path from 'node:path';

export const LOCAL_DB_PORT = 27018;

// Always run from the backend folder, however the script was launched (e.g. `npm --prefix backend`),
// so .env, .dev-db, uploads and the cached MongoDB binary are all found in the right place.
const backendRoot = path.resolve(__dirname, '..', '..');
process.chdir(backendRoot);
// Reuse the MongoDB binary cached by the test suite instead of downloading it again.
process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(backendRoot, 'node_modules', '.cache', 'mongodb-memory-server');

process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = `mongodb://127.0.0.1:${LOCAL_DB_PORT}/portfolio`;
process.env.JWT_SECRET ||= randomBytes(48).toString('base64url');
