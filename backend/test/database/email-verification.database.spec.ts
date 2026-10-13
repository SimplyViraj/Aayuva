import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../src/database/prisma.service';
import { validateEnvironment } from '../../src/config/environment';
import { isolatedDatabaseUrl } from '../../scripts/test-database-url.mjs';
import { issueCapability } from '../../src/modules/auth/registration/capabilities';
import { PendingContextService } from '../../src/modules/auth/registration/pending-context.service';
import { RegistrationRateLimits } from '../../src/modules/auth/registration/rate-limits.service';
import { EmailVerificationService } from '../../src/modules/auth/registration/email-verification.service';
config({ path: '.env.database.local', quiet: true });

describe('registration email - DEV-014 / VAL-001/VAL-015/VAL-016, substitute delivery', () => {
  let db: PrismaService; let keyId: string; let service: EmailVerificationService;
  let send: jest.Mock<Promise<void>, [string, string, string]>;
  const pendingIds = new Set<string>();
  const pending = async (): Promise<{ id: string; token: string; email: string }> => {
    const capability = issueCapability('pending_registration'); const id = randomUUID(); pendingIds.add(id); const now = new Date(); const email = id + '@example.test';
    await db.pendingRegistration.create({ data: { id, capabilityHash: capability.hash, primaryMethod: 'EMAIL_PASSWORD', primarySubject: email, createdAt: now, expiresAt: new Date(now.getTime() + 1_800_000) } });
    return { token: capability.token, id, email };
  };
  beforeAll(async () => {
    db = new PrismaService(new ConfigService(validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: isolatedDatabaseUrl() })));
    await db.onModuleInit();
  });
  beforeEach(() => {
    keyId = randomUUID().replaceAll('-', ''); send = jest.fn<Promise<void>, [string, string, string]>().mockResolvedValue(undefined);
    service = new EmailVerificationService(db, new PendingContextService(), new RegistrationRateLimits(keyId, Buffer.alloc(32, 8)), { send });
  });
  afterEach(async () => { await db.registrationRateEvent.deleteMany({ where: { keyId } }); });
  afterAll(async () => { if (db) { await db.pendingRegistration.deleteMany({ where: { id: { in: [...pendingIds] } } }); await db.onModuleDestroy(); } });
  it('expires from issue time and consumes only once under concurrent submissions', async () => {
    const context = await pending(); const response = await service.request(context.token, context.email, 'fixture-ip');
    const proof = await db.registrationEmailAuthorization.findFirstOrThrow({ where: { pendingId: context.id } });
    const authorization = send.mock.calls[0]![1];
    expect(proof.expiresAt.getTime() - proof.createdAt.getTime()).toBe(300_000);
    expect(Object.keys(response).sort()).toEqual(['expiresAt', 'resendAt']);
    expect(JSON.stringify(proof)).not.toContain(authorization);
    expect((await db.pendingRegistration.findUniqueOrThrow({ where: { id: context.id } })).emailVerifiedAt).toBeNull();
    const results = await Promise.allSettled([service.verify(context.token, authorization, 'fixture-ip'), service.verify(context.token, authorization, 'fixture-ip')]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await db.registrationEmailAuthorization.findUnique({ where: { id: proof.id }, select: { status: true, tokenHash: true } })).toEqual({ status: 'CONSUMED', tokenHash: null });
    expect((await db.pendingRegistration.findUniqueOrThrow({ where: { id: context.id } })).emailVerifiedAt).not.toBeNull();
  });
  it('supersedes immediately even when delivery of the new authorization is uncertain', async () => {
    const context = await pending(); await service.request(context.token, context.email, 'fixture-ip');
    const old = send.mock.calls[0]![1];
    await expect(service.request(context.token, context.email, 'fixture-ip')).rejects.toMatchObject({ status: 429 });
    // Controlled test clock boundary in the stored cooldown; no production delay.
    await db.pendingRegistration.update({ where: { id: context.id }, data: { emailLastIssuedAt: new Date(Date.now() - 31_000) } });
    send.mockRejectedValueOnce(new Error('delivery-secret-canary'));
    await expect(service.request(context.token, context.email, 'fixture-ip')).rejects.toMatchObject({ status: 503 });
    await expect(service.verify(context.token, old, 'fixture-ip')).rejects.toMatchObject({ status: 401 });
    expect(await db.registrationEmailAuthorization.findMany({ where: { pendingId: context.id }, orderBy: { generation: 'asc' }, select: { status: true, deliveryStatus: true } })).toEqual([
      { status: 'SUPERSEDED', deliveryStatus: 'SENT' }, { status: 'ACTIVE', deliveryStatus: 'INDETERMINATE' },
    ]);
  });
  it('binds proof to its context and prevents purpose substitution', async () => {
    const first = await pending(); const second = await pending();
    await service.request(first.token, first.email, 'fixture-ip');
    await expect(service.verify(second.token, send.mock.calls[0]![1], 'fixture-ip')).rejects.toMatchObject({ status: 401 });
    await expect(service.verify(first.token, first.token, 'fixture-ip')).rejects.toMatchObject({ status: 401 });
    expect((await db.pendingRegistration.findUniqueOrThrow({ where: { id: second.id } })).emailVerifiedAt).toBeNull();
  });
  it('counts invalid verification submissions persistently and blocks the next', async () => {
    const context = await pending();
    for (let count = 0; count < 10; count++) await expect(service.verify(context.token, 'malformed', 'fixture-ip')).rejects.toMatchObject({ status: 401 });
    await expect(service.verify(context.token, 'malformed', 'fixture-ip')).rejects.toMatchObject({ status: 429 });
    expect(await db.registrationRateEvent.count({ where: { keyId, operation: 'EMAIL_CHECK' } })).toBe(20);
  });
});
