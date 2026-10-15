import { ApiClient } from '../../../lib/api/client';
import { pendingCredential, type PendingCredential } from './pending-store';

export type SocialMethod = 'GOOGLE' | 'APPLE';
export type SocialPlatform = 'IOS' | 'ANDROID';
export interface SocialFlow { token: string; nonce: string; expiresAt: string }
export interface SocialSession { kind: 'session'; accessToken: string; expiresAt: string }
export type SocialResult = ({ kind: 'onboarding' } & PendingCredential) | SocialSession;
export interface SocialApi {
  start(provider: SocialMethod, platform: SocialPlatform): Promise<SocialFlow>;
  complete(token: string, idToken: string, displayName?: string): Promise<SocialResult>;
  context(token: string): Promise<{ displayName: string }>;
  logout(token: string): Promise<void>;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid sign-in response.');
  return value as Record<string, unknown>;
}
function expiry(value: unknown): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error('Invalid sign-in response.');
  return value;
}
export function socialApi(client: ApiClient): SocialApi {
  return {
    start: (provider, platform) => client.request('/auth/social/flows', (value) => {
      const body = object(value); const credential = pendingCredential(body);
      if (typeof body.nonce !== 'string' || !/^[a-f0-9]{64}$/.test(body.nonce)) throw new Error('Invalid sign-in response.');
      return { ...credential, nonce: body.nonce };
    }, { method: 'POST', body: { provider, platform } }),
    complete: (token, idToken, displayName) => client.request('/auth/social/complete', (value): SocialResult => {
      const body = object(value);
      if (body.kind === 'onboarding' && body.accessToken === undefined) return { kind: 'onboarding', ...pendingCredential(body) };
      if (body.kind !== 'session' || body.token !== undefined || typeof body.accessToken !== 'string' || body.accessToken.length > 16384 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(body.accessToken)) throw new Error('Invalid sign-in response.');
      return { kind: 'session', accessToken: body.accessToken, expiresAt: expiry(body.expiresAt) };
    }, { method: 'POST', body: { token, idToken, ...(displayName ? { displayName } : {}) } }),
    context: (token) => client.request('/auth/me', (value) => {
      const body = object(value);
      if (typeof body.displayName !== 'string' || !body.displayName.trim() || Array.from(body.displayName).length > 100) throw new Error('Invalid sign-in response.');
      return { displayName: body.displayName };
    }, { accessToken: token }),
    logout: (token) => client.request('/auth/logout', (value) => { if (value !== undefined) throw new Error('Invalid sign-out response.'); }, { method: 'POST', accessToken: token }),
  };
}
