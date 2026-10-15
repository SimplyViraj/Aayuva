import { ApiClient } from '../src/lib/api/client';
import { socialApi } from '../src/features/auth/services/social-api';

const expiresAt = '2100-01-01T00:00:00.000Z';
function fixture(body: unknown, status = 200) {
  const fetcher = jest.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });
  return { api: socialApi(new ApiClient('https://fixture.test', 1000, fetcher)), fetcher };
}
it('binds a start to provider/platform without treating the flow as member authority', async () => {
  const { api, fetcher } = fixture({ token: 'A'.repeat(43), nonce: 'a'.repeat(64), expiresAt });
  expect((await api.start('GOOGLE', 'IOS')).nonce).toBe('a'.repeat(64));
  expect(fetcher.mock.calls[0]?.[1].body).toBe(JSON.stringify({ provider: 'GOOGLE', platform: 'IOS' }));
  expect(fetcher.mock.calls[0]?.[1].headers).not.toHaveProperty('Authorization');
});
it.each([{ kind: 'session', token: 'A'.repeat(43), accessToken: 'a.b.c', expiresAt }, { kind: 'onboarding', accessToken: 'a.b.c', token: 'A'.repeat(43), expiresAt }, { kind: 'session', accessToken: 'not-a-token', expiresAt }])('rejects mixed/malformed issuance contracts %#', async (body) => {
  await expect(fixture(body).api.complete('A'.repeat(43), 'provider.id.token')).rejects.toMatchObject({ code: 'invalid_response' });
});
it('does not retry or display a provider failure body', async () => {
  const { api, fetcher } = fixture({ secret: 'private-provider-canary' }, 503);
  await expect(api.complete('A'.repeat(43), 'provider.id.token')).rejects.toThrow('The service is temporarily unavailable.'); expect(fetcher).toHaveBeenCalledTimes(1);
});
