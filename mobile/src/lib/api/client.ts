export type ApiErrorCode = 'invalid_request' | 'invalid_response' | 'unauthenticated' | 'denied' | 'rate_limited' | 'conflict' | 'timeout' | 'cancelled' | 'unavailable';

const MESSAGES: Record<ApiErrorCode, string> = {
  invalid_request: 'Check the submitted information.',
  invalid_response: 'The service returned an unexpected response.',
  unauthenticated: 'Sign in to continue.',
  denied: 'You do not have access to this action.',
  rate_limited: 'Please try again later.',
  conflict: 'The action could not be completed.',
  timeout: 'The request timed out. Its outcome may be unknown.',
  cancelled: 'The request was cancelled. Its outcome may be unknown.',
  unavailable: 'The service is temporarily unavailable.',
};

export class ApiError extends Error {
  constructor(readonly code: ApiErrorCode, readonly status?: number) {
    super(MESSAGES[code]);
    this.name = 'ApiError';
  }
}

export type Fetcher = (url: string, options: RequestInit) => Promise<Response>;
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
}

export class ApiClient {
  private readonly base: URL;

  // The caller supplies a validated public API base and an explicit deadline.
  // A test-only deadline is not a production performance/timeout policy.
  constructor(baseUrl: string, private readonly timeoutMs: number, private readonly fetcher: Fetcher = fetch) {
    try { this.base = new URL(baseUrl); }
    catch { throw new ApiError('invalid_request'); }
    if (!['https:', 'http:'].includes(this.base.protocol) || this.base.username || this.base.password || this.base.search || this.base.hash ||
        !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
      throw new ApiError('invalid_request');
    }
  }

  async request<T>(path: string, decode: (body: unknown) => T, options: ApiRequestOptions = {}): Promise<T> {
    if (!path.startsWith('/') || path.startsWith('//') || /[?#\\]/.test(path)) throw new ApiError('invalid_request');
    const prefix = this.base.pathname.replace(/\/$/, '');
    const url = new URL(this.base.toString().replace(/\/$/, '') + path);
    if (url.origin !== this.base.origin || !url.pathname.startsWith(prefix + '/')) throw new ApiError('invalid_request');
    if (options.signal?.aborted) throw new ApiError('cancelled');
    let body: string | undefined;
    try { body = options.body === undefined ? undefined : JSON.stringify(options.body); }
    catch { throw new ApiError('invalid_request'); }

    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort();
    options.signal?.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, this.timeoutMs);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (options.accessToken) headers.Authorization = 'Bearer ' + options.accessToken;
      const response = await this.fetcher(url.toString(), {
        method: options.method ?? 'GET', headers, body,
        signal: controller.signal, credentials: 'omit', redirect: 'error', cache: 'no-store',
      });
      if (!response.ok) {
        const codes: Record<number, ApiErrorCode> = { 400: 'invalid_request', 401: 'unauthenticated', 403: 'denied', 409: 'conflict', 422: 'invalid_request', 429: 'rate_limited' };
        // Never parse/render an arbitrary failure body or retry a sensitive action.
        throw new ApiError(codes[response.status] ?? 'unavailable', response.status);
      }
      try { return decode(response.status === 204 ? undefined : await response.json() as unknown); }
      catch (error) {
        if (controller.signal.aborted) throw error;
        throw new ApiError('invalid_response');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(timedOut ? 'timeout' : options.signal?.aborted ? 'cancelled' : 'unavailable');
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', cancel);
    }
  }
}
