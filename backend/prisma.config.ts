import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
config({ path: '.env.database.local', quiet: true });
config({ quiet: true });
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Generation never connects; migrations reject an absent URL.
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
