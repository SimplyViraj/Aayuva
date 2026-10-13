import { ConfigurationError, validateEnvironment } from '../src/config/environment';

describe('environment validation', () => {
  it.each(['development', 'test', 'staging', 'production'])('loads the %s environment with inactive methods', (environment) => {
    expect(validateEnvironment({ NODE_ENV: environment }).PORT).toBe(3000);
  });

  it.each([undefined, '', 'prod', 'secret-canary'])('rejects an unknown or absent environment without echoing it', (environment) => {
    expect(() => validateEnvironment({ NODE_ENV: environment })).toThrow('Invalid configuration: NODE_ENV');
  });

  it.each(['0', '65536', '1e3', '3000oops', '1.5', ''])('rejects invalid ports: %s', (port) => {
    expect(() => validateEnvironment({ NODE_ENV: 'test', PORT: port })).toThrow(ConfigurationError);
  });

  it.each(['AUTH_PASSWORD_ENABLED', 'AUTH_PHONE_ENABLED', 'AUTH_GOOGLE_ENABLED', 'AUTH_APPLE_ENABLED'])('rejects activation of unfinished %s', (flag) => {
    expect(() => validateEnvironment({ NODE_ENV: 'test', [flag]: 'true' })).toThrow(flag);
    expect(() => validateEnvironment({ NODE_ENV: 'test', [flag]: 'yes' })).toThrow(flag);
    expect(validateEnvironment({ NODE_ENV: 'test', [flag]: 'false' })).toHaveProperty(flag, false);
  });

  it('permits local documentation and rejects public deployment documentation', () => {
    expect(validateEnvironment({ NODE_ENV: 'development', API_DOCS_ENABLED: 'true' }).API_DOCS_ENABLED).toBe(true);
    expect(() => validateEnvironment({ NODE_ENV: 'production', API_DOCS_ENABLED: 'true' })).toThrow('API_DOCS_ENABLED');
    expect(() => validateEnvironment({ NODE_ENV: 'test', API_DOCS_ENABLED: 'yes' })).toThrow('API_DOCS_ENABLED');
  });

  it('does not include unused environment secrets in the validated result', () => {
    const config = validateEnvironment({ NODE_ENV: 'test', UNUSED_SECRET: 'secret-canary' });
    expect(JSON.stringify(config)).not.toContain('secret-canary');
  });
  it.each(['https://secret-canary.example/db', 'not-a-url-secret-canary', 123, { value: 'secret-canary' }])('rejects invalid database configuration without leaking it', (value) => {
    expect(() => validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: value })).toThrow('Invalid configuration: DATABASE_URL');
  });
});
