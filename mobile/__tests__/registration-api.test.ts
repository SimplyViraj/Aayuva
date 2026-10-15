import { ApiClient, Fetcher } from '../src/lib/api/client';
import { registrationApi } from '../src/features/auth/services/registration-api';

const status = { stage: 'onboarding', displayName: 'Member', phone: null, email: 'member@example.test', phoneVerified: false, emailVerified: false, emailRequired: true, expiresAt: '2100-01-01T00:00:00.000Z', phoneResendAt: null, emailResendAt: null };
it('decodes only backend account status and handles bodyless profile responses', async () => {
  const fetcher = jest.fn<ReturnType<Fetcher>, Parameters<Fetcher>>().mockResolvedValue(new Response(JSON.stringify({ ...status, role: 'ADMIN', capabilityHash: 'secret-canary' })));
  const api = registrationApi(new ApiClient('https://api.example.test', 1000, fetcher), 'A'.repeat(43));
  expect(await api.status()).toEqual(status);
  fetcher.mockResolvedValue(new Response(null, { status: 204 }));
  await expect(api.profile('Member')).resolves.toBeUndefined();
  expect(fetcher.mock.calls[1]?.[1]).toMatchObject({ method: 'PATCH', body: JSON.stringify({ displayName: 'Member' }) });
});
it('rejects malformed verification/status contracts instead of granting completion', async () => {
  const fetcher = jest.fn<ReturnType<Fetcher>, Parameters<Fetcher>>().mockResolvedValue(new Response(JSON.stringify({ ...status, phoneVerified: 'true' })));
  const api = registrationApi(new ApiClient('https://api.example.test', 1000, fetcher), 'A'.repeat(43));
  await expect(api.status()).rejects.toMatchObject({ code: 'invalid_response' });
  fetcher.mockResolvedValue(new Response(JSON.stringify({ verified: false })));
  await expect(api.checkPhone('123456')).rejects.toMatchObject({ code: 'invalid_response' });
  fetcher.mockResolvedValue(new Response(JSON.stringify({ completed: false, secret: 'canary' })));
  await expect(api.complete()).rejects.toMatchObject({ code: 'invalid_response' });
});
