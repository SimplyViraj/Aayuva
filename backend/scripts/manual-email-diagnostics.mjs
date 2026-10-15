import { providerObject } from '../dist/modules/auth/providers/provider-response.js';

// Manual-test entry only. Provider bodies can contain personal data; report
// fixed categories and HTTP status, never the body or the thrown exception.
export function createManualEmailFetch(fetcher = globalThis.fetch, report = () => {}) {
  const emit = (status, reason) => {
    try { report({ status, reason }); } catch { /* Diagnostics cannot change delivery outcomes. */ }
  };
  return async (...args) => {
    let response;
    try { response = await fetcher(...args); }
    catch (error) { emit(null, 'transport_unavailable'); throw error; }
    if (response.ok) return response;
    let reason = response.status === 401 ? 'api_key_rejected'
      : response.status === 429 ? 'provider_rate_limited' : 'provider_rejected';
    try {
      const body = await providerObject(response);
      const message = typeof body.message === 'string' ? body.message.toLowerCase() : '';
      if (response.status === 403 && message.includes('only send testing emails') && message.includes('own')) reason = 'test_recipient_restricted';
      else if (response.status === 403 && message.includes('domain') && message.includes('not verified')) reason = 'sender_domain_unverified';
      else if (['missing_api_key', 'invalid_api_key', 'restricted_api_key', 'suspended_api_key'].includes(body.name)) reason = 'api_key_rejected';
    } catch { /* Malformed/oversized bodies retain the safe HTTP category. */ }
    emit(response.status, reason);
    // The delivery adapter rejects non-2xx responses before reading their body.
    return response;
  };
}
