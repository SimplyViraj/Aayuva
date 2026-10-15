import { generateKeyPairSync } from 'node:crypto';
import { createLocalJWKSet, SignJWT, type JWTPayload } from 'jose';
import type { SocialSettings } from '../src/modules/auth/social/social-settings';

// Synthetic signing authority only. Never used by a production module.
export const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
export const settings: SocialSettings = {
  google: { audience: 'fixture-web', iosClientId: 'fixture-ios', androidClientId: 'fixture-android' }, apple: { audience: 'com.fixture.aayuva' },
  issuer: 'https://fixture.aayuva.test', audience: 'fixture-member', keyId: 'fixture-app',
  privateKey: keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(), publicKey: keys.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
};
export const jwk = { ...keys.publicKey.export({ format: 'jwk' }), kid: 'fixture-provider', alg: 'RS256', use: 'sig' };
export function localKeys(): ReturnType<typeof createLocalJWKSet> { return createLocalJWKSet({ keys: [jwk] }); }
export async function providerToken(provider: 'GOOGLE' | 'APPLE', nonce: string, subject: string, extra: JWTPayload = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ iss: provider === 'GOOGLE' ? 'https://accounts.google.com' : 'https://appleid.apple.com', aud: provider === 'GOOGLE' ? settings.google!.audience : settings.apple!.audience,
    sub: subject, iat: now, exp: now + 300, nonce, ...extra }).setProtectedHeader({ alg: 'RS256', kid: jwk.kid }).sign(keys.privateKey);
}
