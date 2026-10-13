import { loadMobileEnvironment } from '../src/lib/config/environment';

it('requires explicit public configuration and hides malformed values', () => {
  expect(() => loadMobileEnvironment({}, true)).toThrow('Invalid application environment.');
  expect(() => loadMobileEnvironment({ appEnvironment: 'production', apiBaseUrl: 'secret-canary' }, false)).toThrow('Invalid API configuration.');
});

it('permits HTTP only in a development build with an explicit local environment', () => {
  const raw = { appEnvironment: 'development', apiBaseUrl: 'http://10.0.2.2:3000/' };
  expect(loadMobileEnvironment(raw, true).apiBaseUrl).toBe('http://10.0.2.2:3000');
  expect(() => loadMobileEnvironment(raw, false)).toThrow('Invalid API configuration.');
  expect(() => loadMobileEnvironment({ ...raw, appEnvironment: 'production' }, true)).toThrow('Invalid API configuration.');
});

it.each([
  'https://name:secret@example.test', 'https://example.test?token=secret',
  'https://example.test#secret', 'ftp://example.test',
])('rejects credentials, queries, fragments and unsupported schemes', (apiBaseUrl) => {
  expect(() => loadMobileEnvironment({ appEnvironment: 'production', apiBaseUrl }, false)).toThrow('Invalid API configuration.');
});

it('accepts a production HTTPS base without exposing other environment settings', () => {
  expect(loadMobileEnvironment({ appEnvironment: 'production', apiBaseUrl: 'https://api.example.test/v1/' }, false)).toEqual({ environment: 'production', apiBaseUrl: 'https://api.example.test/v1' });
});
