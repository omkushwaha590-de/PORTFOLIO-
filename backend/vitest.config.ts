import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup-env.ts'],
    // One in-memory MongoDB is shared per file; run files sequentially to keep it simple.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
