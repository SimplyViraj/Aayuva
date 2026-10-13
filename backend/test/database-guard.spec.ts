import { isolatedDatabaseUrl } from '../scripts/test-database-url.mjs';

describe('isolated database safety - DEV-009/VAL-015', () => {
  const fixture = 'postgresql://fixture:secret-canary@127.0.0.1:54329/aayuva_test';
  it('allows only the explicitly selected local test fixture', () => {
    expect(isolatedDatabaseUrl({ NODE_ENV: 'test', TEST_DATABASE_URL: fixture })).toBe(fixture);
  });
  it.each([
    { NODE_ENV: 'production', TEST_DATABASE_URL: fixture },
    { NODE_ENV: 'test' },
    { NODE_ENV: 'test', TEST_DATABASE_URL: 'secret-canary' },
    { NODE_ENV: 'test', TEST_DATABASE_URL: fixture.replace('127.0.0.1', 'database.example.test') },
    { NODE_ENV: 'test', TEST_DATABASE_URL: fixture.replace('54329', '5432') },
    { NODE_ENV: 'test', TEST_DATABASE_URL: fixture.replace('aayuva_test', 'production') },
  ])('refuses unsafe configuration without leaking credentials: %j', (environment) => {
    let failure: unknown;
    try { isolatedDatabaseUrl(environment); } catch (error) { failure = error; }
    expect(failure).toBeInstanceOf(Error);
    expect(String(failure)).not.toContain('secret-canary');
  });
});
