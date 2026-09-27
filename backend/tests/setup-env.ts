// Runs before any module import in each test file, so `config/env` sees these values.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://placeholder-replaced-by-memory-server';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-validation-123456';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.STORAGE_DRIVER = 'local';
process.env.PUBLIC_API_URL = 'http://localhost:4000';
process.env.TURNSTILE_SECRET_KEY = '';
process.env.RESEND_API_KEY = '';
process.env.LOGIN_MAX_ATTEMPTS = '5';
process.env.INTERNAL_API_KEY = 'internal-test-key-that-is-long-enough-000000';
