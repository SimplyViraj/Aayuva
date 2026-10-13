export function isolatedDatabaseUrl(environment = process.env) {
  if (environment.NODE_ENV !== 'test') throw new Error('Database tests require NODE_ENV=test.');
  const value = environment.TEST_DATABASE_URL;
  if (!value) throw new Error('TEST_DATABASE_URL required; database tests are never silently skipped.');
  let url;
  try { url = new URL(value); }
  catch { throw new Error('Invalid fixture database configuration.'); }
  if (!['postgresql:', 'postgres:'].includes(url.protocol) || url.hostname !== '127.0.0.1' || url.port !== '54329' || url.pathname !== '/aayuva_test') {
    throw new Error('Refusing a database outside the isolated local fixture.');
  }
  return value;
}
