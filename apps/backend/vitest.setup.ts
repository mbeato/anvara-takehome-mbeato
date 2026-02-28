// vitest.setup.ts — runs before every test file via setupFiles
process.env.DATABASE_URL = 'postgresql://mock';
process.env.BETTER_AUTH_SECRET = 'test-secret';
