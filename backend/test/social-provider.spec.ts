import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { SignJWT } from 'jose';
import { generateKeyPairSync } from 'node:crypto';
import { SocialProviderVerifier, providerKeys } from '../src/modules/auth/social/provider-verifier';
import { socialNonceHash } from '../src/modules/auth/registration/capabilities';
import { socialSettings } from '../src/modules/auth/social/social-settings';
import { validateEnvironment } from '../src/config/environment';
import { keys, settings, localKeys, providerToken, jwk } from './social-fixture';

const nonce = 'a'.repeat(64);
const hash = socialNonceHash(nonce);
const verifier = (): SocialProviderVerifier => new SocialProviderVerifier(settings, { google: localKeys(), apple: localKeys() });
describe('social provider verification - DEV-021/DEV-022, VAL-005/VAL-012', () => {
  it('uses signed Google identity/profile and authoritative verified Gmail only', async () => {
    const identity = await verifier().verify('GOOGLE', 'IOS', await providerToken('GOOGLE', nonce, 'subject', { name: ' Member ', email: ' MEMBER@GMAIL.COM ', email_verified: true, azp: 'fixture-ios' }), hash);
    expect(identity).toEqual({ method: 'GOOGLE', subject: 'subject', displayName: 'Member', verifiedEmail: 'member@gmail.com' });
  });
  it('preserves stable Apple identity and verified relay email without requiring name', async () => {
    expect(await verifier().verify('APPLE', 'IOS', await providerToken('APPLE', nonce, 'stable-sub', { email: 'relay@privaterelay.appleid.com', email_verified: 'true' }), hash))
      .toEqual({ method: 'APPLE', subject: 'stable-sub', verifiedEmail: 'relay@privaterelay.appleid.com' });
  });
  it('does not infer current third-party mailbox ownership from historical Google verification', async () => {
    expect(await verifier().verify('GOOGLE', 'ANDROID', await providerToken('GOOGLE', nonce, 'subject', { email: 'member@example.test', email_verified: true }), hash)).not.toHaveProperty('verifiedEmail');
  });
  it.each([
    { iss: 'https://attacker.test' }, { aud: 'foreign-client' }, { sub: '' }, { nonce: 'b'.repeat(64) }, { azp: 'foreign-presenter' },
    { exp: Math.floor(Date.now() / 1000) - 31 }, { iat: Math.floor(Date.now() / 1000) + 120 }, { exp: undefined }, { nonce: undefined },
    { aud: ['fixture-web', 'foreign-client'], azp: undefined },
  ])('rejects altered/absent claims %#', async (claims) => {
    await expect(verifier().verify('GOOGLE', 'IOS', await providerToken('GOOGLE', nonce, 'subject', claims), hash)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects wrong provider, invalid signature and symmetric token confusion', async () => {
    const token = await providerToken('GOOGLE', nonce, 'subject');
    await expect(verifier().verify('APPLE', 'IOS', token, hash)).rejects.toBeInstanceOf(UnauthorizedException);
    const signature = token.split('.'); signature[2] = (signature[2]![0] === 'A' ? 'B' : 'A') + signature[2]!.slice(1);
    await expect(verifier().verify('GOOGLE', 'IOS', signature.join('.'), hash)).rejects.toBeInstanceOf(UnauthorizedException);
    const hs = await new SignJWT({ sub: 'subject' }).setProtectedHeader({ alg: 'HS256', kid: jwk.kid }).sign(new Uint8Array(32));
    await expect(verifier().verify('GOOGLE', 'IOS', hs, hash)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects missing/unknown key IDs and oversized evidence', async () => {
    const token = await new SignJWT({ sub: 'subject' }).setProtectedHeader({ alg: 'RS256', kid: 'unknown' }).sign(keys.privateKey);
    await expect(verifier().verify('GOOGLE', 'IOS', token, hash)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(verifier().verify('GOOGLE', 'IOS', 'x'.repeat(16385), hash)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('fails closed for disabled methods and Android Apple', async () => {
    await expect(new SocialProviderVerifier({ ...settings, google: undefined }).verify('GOOGLE', 'IOS', '', hash)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(verifier().verify('APPLE', 'ANDROID', '', hash)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('uses a fixed bounded JWKS fetch and cached keys', async () => {
    const fetcher = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ keys: [jwk] })));
    const verify = new SocialProviderVerifier(settings, { google: providerKeys('GOOGLE'), apple: localKeys() });
    const token = await providerToken('GOOGLE', nonce, 'subject');
    await verify.verify('GOOGLE', 'IOS', token, hash); await verify.verify('GOOGLE', 'IOS', token, hash);
    expect(fetcher).toHaveBeenCalledTimes(1); expect(fetcher.mock.calls[0]?.[0].toString()).toBe('https://www.googleapis.com/oauth2/v3/certs');
    expect(fetcher.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ redirect: 'error', cache: 'no-store' }));
  });
  it.each(['network', 'oversized', 'malformed'])('sanitizes %s JWKS failure and never authenticates', async (kind) => {
    const fetcher = jest.spyOn(globalThis, 'fetch');
    if (kind === 'network') fetcher.mockRejectedValue(new Error('private-provider-canary'));
    else fetcher.mockResolvedValue(new Response(kind === 'oversized' ? 'x'.repeat(65537) : 'private-provider-canary'));
    await expect(new SocialProviderVerifier(settings).verify('GOOGLE', 'IOS', await providerToken('GOOGLE', nonce, 'subject'), hash)).rejects.toThrow('Service Unavailable');
  });
  it('refreshes provider keys on an unknown kid after the bounded cooldown', async () => {
    const rotated = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const nextKey = { ...rotated.publicKey.export({ format: 'jwk' }), kid: 'rotated', alg: 'RS256', use: 'sig' };
    const fetcher = jest.spyOn(globalThis, 'fetch').mockImplementationOnce(async () => new Response(JSON.stringify({ keys: [jwk] })))
      .mockImplementationOnce(async () => new Response(JSON.stringify({ keys: [nextKey] })));
    const verify = new SocialProviderVerifier(settings, { google: providerKeys('GOOGLE'), apple: localKeys() });
    await verify.verify('GOOGLE', 'IOS', await providerToken('GOOGLE', nonce, 'subject'), hash);
    const now = Math.floor(Date.now() / 1000);
    const next = await new SignJWT({ iss: 'https://accounts.google.com', aud: 'fixture-web', sub: 'subject', iat: now, exp: now + 300, nonce }).setProtectedHeader({ alg: 'RS256', kid: 'rotated' }).sign(rotated.privateKey);
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 31_000);
    expect((await verify.verify('GOOGLE', 'IOS', next, hash)).subject).toBe('subject'); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('requires a strong confidential application signing key without exposing rejected values', () => {
    expect(() => socialSettings(new ConfigService({ JWT_PRIVATE_KEY_BASE64: 'secret-canary' })) ).toThrow('Invalid configuration: JWT_PRIVATE_KEY_BASE64');
  });
  it('permits only fully configured social activation and keeps password/phone activation gated', () => {
    const common = { NODE_ENV: 'test', DATABASE_URL: 'postgresql://fixture@127.0.0.1/db', JWT_ISSUER: 'fixture', JWT_AUDIENCE: 'fixture', JWT_KEY_ID: 'fixture', JWT_PRIVATE_KEY_BASE64: Buffer.from(settings.privateKey).toString('base64'), TWILIO_ACCOUNT_SID: 'AC' + 'a'.repeat(32), TWILIO_AUTH_TOKEN: 'a'.repeat(32), TWILIO_VERIFY_SERVICE_SID: 'VA' + 'a'.repeat(32), RESEND_API_KEY: 'fixture', REGISTRATION_EMAIL_SENDER: 'fixture@example.test', REGISTRATION_EMAIL_URL: 'aayuva://verify-email', REGISTRATION_ABUSE_KEY_ID: 'fixture', REGISTRATION_ABUSE_KEY: 'a'.repeat(64) };
    expect(validateEnvironment({ ...common, AUTH_APPLE_ENABLED: 'true', APPLE_IOS_AUDIENCE: settings.apple!.audience }).AUTH_APPLE_ENABLED).toBe(true);
    expect(() => validateEnvironment({ ...common, AUTH_GOOGLE_ENABLED: 'true' })).toThrow('AUTH_GOOGLE_ENABLED');
    expect(() => validateEnvironment({ ...common, AUTH_PASSWORD_ENABLED: 'true' })).toThrow('AUTH_PASSWORD_ENABLED');
  });
});
