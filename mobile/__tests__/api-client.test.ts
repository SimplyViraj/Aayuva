import { ApiClient, ApiError, Fetcher } from '../src/lib/api/client';

const response = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const decode = (body: unknown): { name: string } => {
  if (typeof body === 'object' && body !== null && 'name' in body && typeof body.name === 'string') return { name: body.name };
  throw new Error('decoder-secret-canary');
};

it('sends typed requests to the configured API and decodes success', async () => {
  const fetcher = jest.fn<ReturnType<Fetcher>, Parameters<Fetcher>>().mockResolvedValue(response(200, { name: 'Member' }));
  const client = new ApiClient('https://api.example.test/v1', 1000, fetcher);
  expect(await client.request('/context', decode, { accessToken: 'access-canary' })).toEqual({ name: 'Member' });
  expect(fetcher).toHaveBeenCalledWith('https://api.example.test/v1/context', expect.objectContaining({
    headers: { Accept: 'application/json', Authorization: 'Bearer access-canary' }, redirect: 'error', credentials: 'omit',
  }));
});

it.each([[401, 'unauthenticated'], [403, 'denied'], [429, 'rate_limited'], [500, 'unavailable']] as const)('maps status %s safely without retries or error-body exposure', async (status, code) => {
  const fetcher = jest.fn<ReturnType<Fetcher>, Parameters<Fetcher>>().mockResolvedValue(response(status, { password: 'secret-canary' }));
  const client = new ApiClient('https://api.example.test', 1000, fetcher);
  await expect(client.request('/context', decode)).rejects.toMatchObject({ code, status });
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('sanitizes malformed contracts and transport failures', async () => {
  const fetcher = jest.fn<ReturnType<Fetcher>, Parameters<Fetcher>>().mockResolvedValue(response(200, { secret: 'secret-canary' }));
  const client = new ApiClient('https://api.example.test', 1000, fetcher);
  await expect(client.request('/context', decode)).rejects.toThrow('The service returned an unexpected response.');
  fetcher.mockRejectedValue(new Error('provider-secret-canary'));
  await expect(client.request('/context', decode)).rejects.toThrow('The service is temporarily unavailable.');
});

it.each(['//foreign.test/context', '/../outside', '/context?token=secret', '/context#secret'])('rejects paths outside its base or containing hidden parameters', async (path) => {
  const fetcher = jest.fn<ReturnType<Fetcher>, Parameters<Fetcher>>();
  const client = new ApiClient('https://api.example.test/v1', 1000, fetcher);
  await expect(client.request(path, decode)).rejects.toBeInstanceOf(ApiError);
  expect(fetcher).not.toHaveBeenCalled();
});

it('reports timeout as an uncertain outcome and releases the request', async () => {
  jest.useFakeTimers();
  try {
    const fetcher: Fetcher = (_url, options) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('secret-canary')), { once: true });
    });
    const result = new ApiClient('https://api.example.test', 20, fetcher).request('/action', decode, { method: 'POST' });
    const expected = expect(result).rejects.toMatchObject({ code: 'timeout' });
    await jest.advanceTimersByTimeAsync(20);
    await expected;
    expect(jest.getTimerCount()).toBe(0);
  } finally { jest.useRealTimers(); }
});

it('cancels without sending an already-aborted request', async () => {
  const controller = new AbortController(); controller.abort();
  const fetcher = jest.fn<ReturnType<Fetcher>, Parameters<Fetcher>>();
  await expect(new ApiClient('https://api.example.test', 1000, fetcher).request('/context', decode, { signal: controller.signal })).rejects.toMatchObject({ code: 'cancelled' });
  expect(fetcher).not.toHaveBeenCalled();
});
