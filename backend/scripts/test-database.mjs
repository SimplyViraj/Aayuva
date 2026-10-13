import { spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceLabel = createHash('sha256').update(packageRoot).digest('hex').slice(0, 12);
const containerName = 'aayuva-test-' + workspaceLabel;
const envPath = path.join(packageRoot, '.env.database.local');
const docker = process.platform === 'win32' ? 'docker.exe' : 'docker';
class FixtureSetupError extends Error {}
function run(args, allowFailure = false) {
  const result = spawnSync(docker, args, { encoding: 'utf8', windowsHide: true });
  if (!allowFailure && result.status !== 0) throw new FixtureSetupError('Test database command failed. Check Docker readiness and local port 54329.');
  return result;
}
try {
  if (process.argv[2] !== 'start') throw new FixtureSetupError('Usage: node scripts/test-database.mjs start');
  const inspected = run(['inspect', containerName], true);
  if (inspected.status === 0) {
    const info = JSON.parse(inspected.stdout)[0];
    if (info.Config.Labels?.['aayuva.test.workspace'] !== workspaceLabel || !existsSync(envPath)) {
      throw new FixtureSetupError('Existing container is not paired with this workspace fixture configuration.');
    }
    if (!info.State.Running) run(['start', containerName]);
  } else {
    if (existsSync(envPath)) throw new FixtureSetupError('Fixture configuration already exists; review it before creating another container.');
    const password = randomBytes(32).toString('hex');
    const result = spawnSync(docker, [
      'run', '--detach', '--name', containerName,
      '--label', 'aayuva.test.workspace=' + workspaceLabel,
      '--publish', '127.0.0.1:54329:5432',
      '--env', 'POSTGRES_USER=aayuva_fixture', '--env', 'POSTGRES_DB=aayuva_test',
      '--env', 'POSTGRES_PASSWORD', 'postgres:18.6-alpine',
    ], { encoding: 'utf8', windowsHide: true, env: { ...process.env, POSTGRES_PASSWORD: password } });
    if (result.status !== 0) throw new FixtureSetupError('Could not create the isolated database. Check Docker, the image and local port 54329.');
    const url = 'postgresql://aayuva_fixture:' + password + '@127.0.0.1:54329/aayuva_test';
    writeFileSync(envPath, 'DATABASE_URL=' + url + '\nTEST_DATABASE_URL=' + url + '\n', { mode: 0o600, flag: 'wx' });
  }
  if (!readFileSync(envPath, 'utf8').includes('TEST_DATABASE_URL=')) throw new FixtureSetupError('Invalid fixture configuration.');
  const ready = run(['exec', containerName, 'pg_isready', '-U', 'aayuva_fixture', '-d', 'aayuva_test'], true);
  console.log(ready.status === 0 ? 'Isolated PostgreSQL ready.' : 'Database starting; rerun to check readiness.');
  console.log('Fixture container: ' + containerName + '; configuration: .env.database.local (git-ignored).');
} catch (error) {
  console.error(error instanceof FixtureSetupError ? error.message : 'Test database setup failed.');
  process.exitCode = 1;
}
