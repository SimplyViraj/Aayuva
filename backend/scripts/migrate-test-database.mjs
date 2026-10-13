import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { isolatedDatabaseUrl } from './test-database-url.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  const fixture = parse(readFileSync(path.join(root, '.env.database.local')));
  const url = isolatedDatabaseUrl({ NODE_ENV: 'test', TEST_DATABASE_URL: fixture.TEST_DATABASE_URL });
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'], {
    cwd: root, stdio: 'inherit', windowsHide: true,
    env: { ...process.env, DATABASE_URL: url },
  });
  process.exitCode = result.status ?? 1;
} catch {
  // Never echo a connection string or an arbitrary parser/provider exception.
  console.error('Isolated migration failed. Check fixture setup and migration files.');
  process.exitCode = 1;
}
