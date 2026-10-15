import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import request from 'supertest';
import { isolatedDatabaseUrl } from '../../scripts/test-database-url.mjs';
import { validateEnvironment } from '../../src/config/environment';
import { PrismaService } from '../../src/database/prisma.service';
import { socialApplication } from '../../src/modules/auth/social/social.module';
import { SocialProviderVerifier } from '../../src/modules/auth/social/provider-verifier';
import { SocialSignInService } from '../../src/modules/auth/social/social-sign-in.service';
import { socialSettings } from '../../src/modules/auth/social/social-settings';
import { capabilityHash } from '../../src/modules/auth/registration/capabilities';
import { settings, localKeys, providerToken } from '../social-fixture';
config({ path: '.env.database.local', quiet: true });

describe('social sign-in transactions/API - R3, DEV-021–DEV-025', () => {
  let app: INestApplication; let db: PrismaService; let prefix: string; let keyId: string;
  const flows: string[] = []; const users: string[] = [];
  beforeEach(async () => {
    prefix = randomUUID(); keyId = randomUUID().replaceAll('-', ''); flows.length = 0; users.length = 0;
    const environment = validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: isolatedDatabaseUrl(), AUTH_GOOGLE_ENABLED: 'true', AUTH_APPLE_ENABLED: 'true',
      GOOGLE_WEB_CLIENT_ID: settings.google!.audience, GOOGLE_IOS_CLIENT_ID: settings.google!.iosClientId, GOOGLE_ANDROID_CLIENT_ID: settings.google!.androidClientId, APPLE_IOS_AUDIENCE: settings.apple!.audience,
      JWT_ISSUER: settings.issuer, JWT_AUDIENCE: settings.audience, JWT_KEY_ID: settings.keyId, JWT_PRIVATE_KEY_BASE64: Buffer.from(settings.privateKey).toString('base64'),
      TWILIO_ACCOUNT_SID: 'AC' + 'a'.repeat(32), TWILIO_AUTH_TOKEN: 'a'.repeat(32), TWILIO_VERIFY_SERVICE_SID: 'VA' + 'a'.repeat(32), RESEND_API_KEY: 'fixture', REGISTRATION_EMAIL_SENDER: 'fixture@example.test', REGISTRATION_EMAIL_URL: 'aayuva://verify-email', REGISTRATION_ABUSE_KEY_ID: keyId, REGISTRATION_ABUSE_KEY: 'a'.repeat(64),
    });
    const module = await Test.createTestingModule({ imports: [socialApplication(environment)] })
      .overrideProvider(SocialProviderVerifier).useValue(new SocialProviderVerifier(socialSettings(new ConfigService(environment)), { google: localKeys(), apple: localKeys() })).compile();
    app = module.createNestApplication({ logger: false }); await app.init(); db = app.get(PrismaService);
  });
  afterEach(async () => {
    if (db) {
      await db.socialSignInFlow.deleteMany({ where: { capabilityHash: { in: flows } } });
      await db.pendingRegistration.deleteMany({ where: { primarySubject: { startsWith: prefix } } });
      await db.session.deleteMany({ where: { userId: { in: users } } });
      await db.userIdentity.deleteMany({ where: { userId: { in: users } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
      await db.registrationRateEvent.deleteMany({ where: { keyId } });
    }
    await app?.close();
  });
  async function start(provider: 'GOOGLE' | 'APPLE' = 'GOOGLE'): Promise<{ token: string; nonce: string }> {
    const response = await request(app.getHttpServer()).post('/auth/social/flows').send({ provider, platform: 'IOS' }).expect(200);
    flows.push(capabilityHash('social_flow', response.body.token as string));
    expect(response.headers['cache-control']).toBe('no-store'); return response.body as { token: string; nonce: string };
  }
  async function member(provider: 'GOOGLE' | 'APPLE' = 'GOOGLE'): Promise<string> {
    const user = await db.user.create({ data: { status: 'ACTIVE', displayName: 'Fixture Member', role: 'MEMBER', primaryMethod: provider,
      phone: '+919' + BigInt('0x' + prefix.replaceAll('-', '').slice(0, 12)).toString().padStart(9, '0').slice(-9), phoneVerifiedAt: new Date(), completedAt: new Date(),
      identities: { create: { method: provider, subject: prefix } } }, select: { id: true } });
    users.push(user.id); return user.id;
  }
  async function complete(flow: { token: string; nonce: string }, provider: 'GOOGLE' | 'APPLE' = 'GOOGLE'): Promise<request.Response> {
    return request(app.getHttpServer()).post('/auth/social/complete').send({ token: flow.token, idToken: await providerToken(provider, flow.nonce, prefix, { email: 'fixture@gmail.com', email_verified: true }) });
  }
  it('starts new identities in onboarding with verified provider profile but no member/session', async () => {
    const flow = await start(); const result = await complete(flow); expect(result.status).toBe(200); expect(result.body.kind).toBe('onboarding');
    expect(result.body).not.toHaveProperty('accessToken');
    const status = await request(app.getHttpServer()).get('/registration').auth(result.body.token as string, { type: 'bearer' }).expect(200);
    expect(status.body).toEqual(expect.objectContaining({ phoneVerified: false, emailVerified: true, emailRequired: false }));
    await request(app.getHttpServer()).get('/auth/me').auth(result.body.token as string, { type: 'bearer' }).expect(401);
    expect(await db.userIdentity.count({ where: { subject: prefix } })).toBe(0);
    const row = await db.socialSignInFlow.findUniqueOrThrow({ where: { capabilityHash: flows[0]! } });
    expect(row.consumedAt).not.toBeNull(); expect(JSON.stringify(row)).not.toContain(flow.nonce);
  });
  it('atomically issues only one session for concurrent completion and rejects replay', async () => {
    const userId = await member(); const flow = await start();
    const results = await Promise.all([complete(flow), complete(flow)]);
    expect(results.map((value) => value.status).sort()).toEqual([200, 401]);
    expect(await db.session.count({ where: { userId } })).toBe(1);
    const token = results.find((result) => result.status === 200)!.body.accessToken as string;
    await request(app.getHttpServer()).get('/auth/me').auth(token, { type: 'bearer' }).expect(200, { displayName: 'Fixture Member' });
    await request(app.getHttpServer()).post('/auth/logout').auth(token, { type: 'bearer' }).expect(204);
    await request(app.getHttpServer()).get('/auth/me').auth(token, { type: 'bearer' }).expect(401);
    await request(app.getHttpServer()).post('/auth/logout').auth(token, { type: 'bearer' }).expect(401);
  });
  it('resolves the same Apple subject with relay/absent profile without duplicating a member', async () => {
    const userId = await member('APPLE'); const one = await complete(await start('APPLE'), 'APPLE'); const two = await complete(await start('APPLE'), 'APPLE');
    expect(one.body.kind).toBe('session'); expect(two.body.kind).toBe('session');
    expect(await db.userIdentity.count({ where: { subject: prefix } })).toBe(1); expect(await db.session.count({ where: { userId } })).toBe(2);
  });
  it('reserves five failed checks and refuses a later valid proof without issuing access', async () => {
    const flow = await start();
    for (let count = 0; count < 5; count++) {
      await request(app.getHttpServer()).post('/auth/social/complete').send({ token: flow.token, idToken: await providerToken('GOOGLE', 'b'.repeat(64), prefix) }).expect(401);
    }
    expect((await complete(flow)).status).toBe(401);
    expect((await db.socialSignInFlow.findUniqueOrThrow({ where: { capabilityHash: flows[0]! } })).attempts).toBe(5);
  });
  it('keeps privileged-method activation gated despite a verified provider association', async () => {
    const userId = await member(); await db.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
    expect((await complete(await start())).status).toBe(401);
    expect(await db.session.count({ where: { userId } })).toBe(0);
  });
  it('locks member issuance so two concurrent flows cannot exceed five live sessions', async () => {
    const userId = await member(); const now = new Date();
    await db.session.createMany({ data: Array.from({ length: 4 }, () => ({ userId, expiresAt: new Date(now.getTime() + 900000) })) });
    const one = await start(); const two = await start();
    const results = await Promise.all([complete(one), complete(two)]);
    expect(results.map((result) => result.status).sort()).toEqual([200, 409]);
    expect(await db.session.count({ where: { userId } })).toBe(5);
    expect(await db.socialSignInFlow.count({ where: { capabilityHash: { in: flows }, consumedAt: { not: null } } })).toBe(1);
  });
  it('rejects client authority, disabled platform and expired flows; no session is inferred', async () => {
    await request(app.getHttpServer()).post('/auth/social/flows').send({ provider: 'GOOGLE', platform: 'IOS', role: 'ADMIN' }).expect(400);
    await request(app.getHttpServer()).post('/auth/social/flows').send({ provider: 'APPLE', platform: 'ANDROID' }).expect(503);
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    const flow = await start(); const expired = new Date(Date.now() - 1000);
    await db.socialSignInFlow.update({ where: { capabilityHash: flows[0]! }, data: { createdAt: new Date(expired.getTime() - 300000), expiresAt: expired } });
    expect((await complete(flow)).status).toBe(401);
  });
  it('rechecks expiry after external verification before committing a sensitive effect', async () => {
    const flow = await start(); const verifier = app.get(SocialProviderVerifier); const original = verifier.verify.bind(verifier);
    jest.spyOn(verifier, 'verify').mockImplementationOnce(async (...args) => {
      const result = await original(...args); const expired = new Date(Date.now() - 1000);
      await db.socialSignInFlow.update({ where: { capabilityHash: flows[0]! }, data: { createdAt: new Date(expired.getTime() - 300000), expiresAt: expired } });
      return result;
    });
    expect((await complete(flow)).status).toBe(401);
    expect(await db.pendingRegistration.count({ where: { primarySubject: prefix } })).toBe(0);
  });
  it('purges consumed metadata with hourly headroom while retaining another owned live flow', async () => {
    await start(); await start(); const consumed = new Date(Date.now() - (23 * 3600000 + 120000));
    await db.socialSignInFlow.update({ where: { capabilityHash: flows[0]! }, data: { createdAt: new Date(consumed.getTime() - 60000), consumedAt: consumed, expiresAt: new Date(consumed.getTime() + 240000) } });
    await app.get(SocialSignInService).purge(flows);
    expect(await db.socialSignInFlow.count({ where: { capabilityHash: { in: flows } } })).toBe(1);
    expect(await db.socialSignInFlow.findUnique({ where: { capabilityHash: flows[1]! } })).not.toBeNull();
  });
});
