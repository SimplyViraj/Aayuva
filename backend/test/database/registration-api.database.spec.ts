import { Global, INestApplication, Module, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { config } from 'dotenv';
import request from 'supertest';
import { CommonModule } from '../../src/common/common.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { PrismaService } from '../../src/database/prisma.service';
import { validateEnvironment } from '../../src/config/environment';
import { isolatedDatabaseUrl } from '../../scripts/test-database-url.mjs';
import { RegistrationModule, REGISTRATION_SETTINGS } from '../../src/modules/auth/registration/registration.module';
import { REGISTRATION_IDENTITY_VERIFIER } from '../../src/modules/auth/registration/registration-identity.guard';
import { TwilioVerify } from '../../src/modules/auth/providers/twilio-verify';
import { ResendRegistrationEmail } from '../../src/modules/auth/providers/resend-registration';
import { capabilityHash } from '../../src/modules/auth/registration/capabilities';
import { RegistrationMaintenance } from '../../src/modules/auth/registration/registration-maintenance.service';
config({ path: '.env.database.local', quiet: true });

@Global()
@Module({ providers: [{ provide: ConfigService, useFactory: (): ConfigService => new ConfigService(validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: isolatedDatabaseUrl() })) }], exports: [ConfigService] })
class FixtureConfig {}

describe('account API - DEV-015/DEV-016, isolated primary/provider fixtures', () => {
  let app: INestApplication; let db: PrismaService; let subject: string;
  const keyId = randomUUID().replaceAll('-', ''); const ids = new Set<string>(); const users = new Set<string>();
  const serviceSid = 'VA' + 'a'.repeat(32);
  const begin = async (): Promise<string> => {
    subject = randomUUID();
    const response = await request(app.getHttpServer()).post('/registration').set('X-Fixture-Primary', 'fixture').send({ displayName: '  Member  ' }).expect(200);
    const token = (response.body as { token: string }).token;
    const pending = await db.pendingRegistration.findUniqueOrThrow({ where: { capabilityHash: capabilityHash('pending_registration', token) }, select: { id: true } });
    ids.add(pending.id); return token;
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [FixtureConfig, CommonModule, AuthModule, RegistrationModule] })
      .overrideProvider(REGISTRATION_SETTINGS).useValue({ abuseKeyId: keyId, abuseKey: Buffer.alloc(32, 9) })
      .overrideProvider(REGISTRATION_IDENTITY_VERIFIER).useValue({ verify: async (req: Request) => {
        if (req.headers['x-fixture-primary'] !== 'fixture') throw new UnauthorizedException();
        return { method: 'GOOGLE', subject };
      } })
      .overrideProvider(TwilioVerify).useValue({ serviceSid,
        send: async (phone: string) => ({ sid: 'VE' + randomUUID().replaceAll('-', ''), serviceSid, phone, status: 'pending' }),
        check: async (sid: string, phone: string) => ({ sid, serviceSid, phone, status: 'approved' }),
        cancel: async () => undefined,
      })
      .overrideProvider(ResendRegistrationEmail).useValue({ send: async () => undefined })
      .compile();
    app = module.createNestApplication({ logger: false }); await app.init(); db = app.get(PrismaService);
  });
  afterEach(async () => { await db.registrationRateEvent.deleteMany({ where: { keyId } }); });
  afterAll(async () => {
    if (db) {
      await db.pendingRegistration.deleteMany({ where: { id: { in: [...ids] } } });
      await db.userIdentity.deleteMany({ where: { userId: { in: [...users] } } });
      await db.user.deleteMany({ where: { id: { in: [...users] } } });
    }
    if (app) await app.close();
  });
  it('rejects client primary/role claims and requires backend primary evidence', async () => {
    await request(app.getHttpServer()).post('/registration').send({ displayName: 'Member', verified: true, role: 'ADMIN' }).expect(401);
    subject = randomUUID();
    await request(app.getHttpServer()).post('/registration').set('X-Fixture-Primary', 'fixture').send({ displayName: 'Member', role: 'ADMIN', subject: 'attacker' }).expect(400);
  });
  it('requires its own capability and returns sanitized uncached status', async () => {
    const token = await begin();
    await request(app.getHttpServer()).get('/registration').expect(401);
    await request(app.getHttpServer()).get('/registration').set('Authorization', 'Bearer arbitrary.jwt.claim').expect(401);
    const response = await request(app.getHttpServer()).get('/registration').set('Authorization', 'Bearer ' + token).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toMatchObject({ stage: 'onboarding', displayName: 'Member', phoneVerified: false, emailRequired: false });
    expect(response.text).not.toContain(token); expect(response.text).not.toContain('capabilityHash'); expect(response.text).not.toContain(subject);
    await request(app.getHttpServer()).patch('/registration/profile').set('Authorization', 'Bearer ' + token).send({ displayName: '😀'.repeat(100) }).expect(204);
    await request(app.getHttpServer()).patch('/registration/profile').set('Authorization', 'Bearer ' + token).send({ displayName: '😀'.repeat(101) }).expect(400);
  });
  it('requires complete proofs, creates a MEMBER once and issues no session', async () => {
    const token = await begin(); const headers = { Authorization: 'Bearer ' + token };
    await request(app.getHttpServer()).post('/registration/complete').set(headers).expect(409);
    await request(app.getHttpServer()).post('/registration/phone').set(headers).send({ phone: '+919876543230' }).expect(200);
    await request(app.getHttpServer()).post('/registration/phone/check').set(headers).send({ code: '123456' }).expect(200);
    const results = await Promise.all([0, 1].map(() => request(app.getHttpServer()).post('/registration/complete').set(headers)));
    expect(results.map((value) => value.status)).toEqual([200, 200]);
    const pending = await db.pendingRegistration.findUniqueOrThrow({ where: { capabilityHash: capabilityHash('pending_registration', token) } });
    users.add(pending.completedUserId!);
    expect(await db.user.findUnique({ where: { id: pending.completedUserId! }, select: { role: true, status: true } })).toEqual({ role: 'MEMBER', status: 'ACTIVE' });
    expect(await db.session.count({ where: { userId: pending.completedUserId! } })).toBe(0);
    expect(await db.userIdentity.count({ where: { userId: pending.completedUserId! } })).toBe(1);
  });
  it('invalidates the capability and earlier email authorization on cancellation', async () => {
    const token = await begin();
    await request(app.getHttpServer()).delete('/registration').set('Authorization', 'Bearer ' + token).expect(204);
    await request(app.getHttpServer()).get('/registration').set('Authorization', 'Bearer ' + token).expect(401);
    await request(app.getHttpServer()).post('/registration/complete').set('Authorization', 'Bearer ' + token).expect(401);
  });
  it('documents only real DTOs/operations without internal models or credentials', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().addBearerAuth({ type: 'http', scheme: 'bearer' }, 'onboarding').build());
    expect(document.paths['/registration/phone/check']?.post?.responses['200']).toBeDefined();
    expect(Object.keys(document.paths)).toHaveLength(8);
    expect(JSON.stringify(document)).not.toContain('capabilityHash'); expect(JSON.stringify(document)).not.toContain('providerSid');
  });
  it('removes old registration metadata without deleting member identities', async () => {
    // Fixture is >7 days old, so its own records are the only eligible rows in
    // this test database. Maintenance is never run against a production target.
    const id = randomUUID(); ids.add(id); const createdAt = new Date(Date.now() - 8 * 86_400_000);
    await db.pendingRegistration.create({ data: { id, capabilityHash: 'f'.repeat(64), primaryMethod: 'GOOGLE', primarySubject: id, createdAt, expiresAt: new Date(createdAt.getTime() + 1_800_000) } });
    await app.get(RegistrationMaintenance).purge({ pendingIds: [id], rateKeyIds: [keyId] });
    expect(await db.pendingRegistration.findUnique({ where: { id } })).toBeNull();
    expect(await db.user.count({ where: { id: { in: [...users] } } })).toBe(users.size);
  });
});
