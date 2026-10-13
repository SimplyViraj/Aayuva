import { generateKeyPairSync } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtAccessVerifier } from '../src/modules/auth/jwt-access-verifier';
import { SessionAuthenticator } from '../src/modules/auth/session-authenticator';
import { StoredSession } from '../src/modules/sessions/session-store.service';
import { FixtureClock } from './helpers/clock';

const userId = '11111111-1111-4111-8111-111111111111';
const sessionId = '22222222-2222-4222-8222-222222222222';
const jwt = new JwtService();
const key = generateKeyPairSync('rsa', { modulusLength: 2048 });
const privateKey = key.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const publicKey = key.publicKey.export({ type: 'spki', format: 'pem' }).toString();

describe('access verification foundation - VAL-007/VAL-011', () => {
  let clock: FixtureClock;
  let verifier: JwtAccessVerifier;
  const token = (overrides: Record<string, unknown> = {}): string => {
    const payload = Object.fromEntries(Object.entries({
      sub: userId, sid: sessionId, purpose: 'access', iss: 'fixture-issuer', aud: 'fixture-audience',
      iat: Math.floor(clock.now() / 1000), exp: Math.floor(clock.now() / 1000) + 900, ...overrides,
    }).filter(([, value]) => value !== undefined));
    return jwt.sign(payload, { algorithm: 'RS256', privateKey, keyid: 'fixture-key', noTimestamp: Object.hasOwn(overrides, 'iat') && overrides.iat === undefined });
  };
  beforeEach(() => {
    clock = new FixtureClock();
    // Explicit test configuration is not an issuer, audience or skew policy approval.
    verifier = new JwtAccessVerifier(jwt, {
      issuer: 'fixture-issuer', audience: 'fixture-audience', publicKeys: { 'fixture-key': publicKey }, clockToleranceSeconds: 0,
    }, clock.now);
  });
  it('returns only the identity/session binding from a verified signature', async () => {
    expect(await verifier.verify(token({ role: 'ADMIN', permissions: ['everything'] }))).toEqual({ userId, sessionId });
  });
  it.each([
    ['issuer', { iss: 'foreign' }], ['audience', { aud: 'foreign' }], ['purpose', { purpose: 'refresh' }],
    ['subject', { sub: 'invalid' }], ['session', { sid: 'invalid' }], ['missing expiry', { exp: undefined }],
    ['missing issue time', { iat: undefined }],
  ])('rejects incorrect %s', async (_label, claims) => {
    await expect(verifier.verify(token(claims as Record<string, unknown>))).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('enforces expiry at the exact boundary using an injected clock', async () => {
    const value = token(); clock.advance(899);
    await expect(verifier.verify(value)).resolves.toEqual({ userId, sessionId });
    clock.advance(1);
    await expect(verifier.verify(value)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects future issue times and lifetimes beyond the approved maximum', async () => {
    const now = Math.floor(clock.now() / 1000);
    await expect(verifier.verify(token({ iat: now + 1 }))).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(verifier.verify(token({ exp: now + 901 }))).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects tampering, unknown keys and algorithm substitution', async () => {
    const valid = token();
    const parts = valid.split('.');
    parts[1] = Buffer.from(JSON.stringify({ sub: userId, sid: sessionId, role: 'ADMIN' })).toString('base64url');
    await expect(verifier.verify(parts.join('.'))).rejects.toBeInstanceOf(UnauthorizedException);
    const unknown = jwt.sign({ sub: userId }, { algorithm: 'RS256', privateKey, keyid: 'retired-key' });
    await expect(verifier.verify(unknown)).rejects.toBeInstanceOf(UnauthorizedException);
    const substituted = jwt.sign({ sub: userId }, { algorithm: 'HS256', secret: 'fixture-secret', keyid: 'fixture-key' });
    await expect(verifier.verify(substituted)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('requires usable verification configuration', () => {
    expect(() => new JwtAccessVerifier(jwt, { issuer: '', audience: '', publicKeys: {}, clockToleranceSeconds: 0 }, clock.now)).toThrow();
  });
  it('rechecks database revocation on every request and freezes the principal', async () => {
    const row: StoredSession = { id: sessionId, userId, expiresAt: new Date(clock.now() + 900_000), revokedAt: null };
    const find = jest.fn().mockImplementation(async (): Promise<StoredSession> => row);
    const authenticate = new SessionAuthenticator(verifier, { find }, clock.now);
    const value = token();
    const principal = await authenticate.authenticate(value);
    expect(Object.isFrozen(principal)).toBe(true);
    row.revokedAt = new Date(clock.now());
    await expect(authenticate.authenticate(value)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(find).toHaveBeenCalledTimes(2);
  });
  it.each(['missing', 'owner', 'session', 'expired', 'invalid date'] as const)('rejects %s database state', async (kind) => {
    const row: StoredSession = { id: sessionId, userId, expiresAt: new Date(clock.now() + 900_000), revokedAt: null };
    if (kind === 'owner') row.userId = sessionId;
    if (kind === 'session') row.id = userId;
    if (kind === 'expired') row.expiresAt = new Date(clock.now());
    if (kind === 'invalid date') row.expiresAt = new Date(NaN);
    const authenticate = new SessionAuthenticator(verifier, { find: async (): Promise<StoredSession | null> => kind === 'missing' ? null : row }, clock.now);
    await expect(authenticate.authenticate(token())).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('fails closed when session storage is unavailable and avoids lookup for invalid tokens', async () => {
    const find = jest.fn().mockRejectedValue(new Error('database credential canary'));
    const authenticate = new SessionAuthenticator(verifier, { find }, clock.now);
    await expect(authenticate.authenticate('invalid')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(find).not.toHaveBeenCalled();
    await expect(authenticate.authenticate(token())).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
