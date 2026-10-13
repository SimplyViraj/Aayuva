import { ApiClient } from '../../../lib/api/client';

export interface RegistrationStatus {
  stage: 'onboarding' | 'completed'; displayName: string | null; phone: string | null; email: string | null;
  phoneVerified: boolean; emailVerified: boolean; emailRequired: boolean; expiresAt: string;
}
export interface VerificationChallenge { expiresAt: string; resendAt: string }
export interface RegistrationApi {
  status(): Promise<RegistrationStatus>;
  profile(displayName: string): Promise<void>;
  phone(phone: string): Promise<VerificationChallenge>;
  checkPhone(code: string): Promise<void>;
  restartPhone(): Promise<void>;
  email(email: string): Promise<VerificationChallenge>;
  checkEmail(authorization: string): Promise<void>;
  complete(): Promise<void>;
  cancel(): Promise<void>;
}
function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Invalid registration response.');
  return value as Record<string, unknown>;
}
function date(value: unknown): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('Invalid registration response.');
  return value;
}
function nullable(value: unknown): string | null {
  if (value !== null && typeof value !== 'string') throw new Error('Invalid registration response.');
  return value;
}
function status(value: unknown): RegistrationStatus {
  const body = object(value);
  if (!['onboarding', 'completed'].includes(String(body.stage)) || typeof body.phoneVerified !== 'boolean' || typeof body.emailVerified !== 'boolean' || typeof body.emailRequired !== 'boolean') throw new Error('Invalid registration response.');
  return { stage: body.stage as RegistrationStatus['stage'], displayName: nullable(body.displayName), phone: nullable(body.phone), email: nullable(body.email), phoneVerified: body.phoneVerified, emailVerified: body.emailVerified, emailRequired: body.emailRequired, expiresAt: date(body.expiresAt) };
}
function challenge(value: unknown): VerificationChallenge {
  const body = object(value); return { expiresAt: date(body.expiresAt), resendAt: date(body.resendAt) };
}
function empty(value: unknown): void { if (value !== undefined) throw new Error('Invalid registration response.'); }
function verified(value: unknown): void { if (object(value).verified !== true) throw new Error('Invalid registration response.'); }
function completed(value: unknown): void { if (object(value).completed !== true) throw new Error('Invalid registration response.'); }

export function registrationApi(client: ApiClient, pendingToken: string): RegistrationApi {
  // Opaque credential only; every decision/transition is checked by NestJS.
  const headers = { accessToken: pendingToken };
  return {
    status: () => client.request('/registration', status, headers),
    profile: (displayName) => client.request('/registration/profile', empty, { ...headers, method: 'PATCH', body: { displayName } }),
    phone: (phone) => client.request('/registration/phone', challenge, { ...headers, method: 'POST', body: { phone } }),
    checkPhone: (code) => client.request('/registration/phone/check', verified, { ...headers, method: 'POST', body: { code } }),
    restartPhone: () => client.request('/registration/phone/restart', empty, { ...headers, method: 'POST' }),
    email: (email) => client.request('/registration/email', challenge, { ...headers, method: 'POST', body: { email } }),
    checkEmail: (authorization) => client.request('/registration/email/check', verified, { ...headers, method: 'POST', body: { authorization } }),
    complete: () => client.request('/registration/complete', completed, { ...headers, method: 'POST' }),
    cancel: () => client.request('/registration', empty, { ...headers, method: 'DELETE' }),
  };
}
