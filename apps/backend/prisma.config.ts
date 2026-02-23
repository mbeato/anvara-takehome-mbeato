import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import path from 'path';

// Load env from monorepo root
import dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx --env-file=../../.env prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
