import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../src/database/prisma.service';
import { validateEnvironment } from '../../src/config/environment';
import { isolatedDatabaseUrl } from '../../scripts/test-database-url.mjs';
import { issueCapability } from '../../src/modules/auth/registration/capabilities';
import { PendingContextService } from '../../src/modules/auth/registration/pending-context.service';
import { RegistrationRateLimits } from '../../src/modules/auth/registration/rate-limits.service';
import { PhoneVerificationService } from '../../src/modules/auth/registration/phone-verification.service';
import type { PhoneVerificationProvider, PhoneVerificationResult } from '../../src/modules/auth/providers/twilio-verify';
config({ path: '.env.database.local', quiet: true });

// Substitute provider exists only in this database test; never in application DI.
class FixtureVerify implements PhoneVerificationProvider {
  readonly serviceSid = 'VA' + 'a'.repeat(32);
  readonly sid = 'VE' + randomUUID().replaceAll('-', '');
  checks = 0; sends = 0; outcome: 'pending' | 'approved' | 'unavailable' = 'pending';
  async send(phone: string): Promise<PhoneVerificationResult> { this.sends++; return { sid: this.sid, serviceSid: this.serviceSid, phone, status: 'pending' }; }
  async check(sid: string, phone: string): Promise<PhoneVerificationResult> {
    this.checks++;
    if (this.outcome === 'unavailable') throw new Error('provider-secret-canary');
    return { sid, serviceSid: this.serviceSid, phone, status: this.outcome };
  }
  async cancel(): Promise<void> { return; }
}

describe('bound verification - DEV-013 / VAL-004/VAL-018 substitute plus PostgreSQL', () => {
  let db: PrismaService; let keyId: string; let service: PhoneVerificationService; let provider: FixtureVerify;
  const pendingIds = new Set<string>();
  const pending = async (): Promise<{ token: string; id: string }> => {
    const capability = issueCapability('pending_registration'); const id = randomUUID(); pendingIds.add(id); const now = new Date();
    await db.pendingRegistration.create({ data: { id, capabilityHash: capability.hash, primaryMethod: 'GOOGLE', primarySubject: id, createdAt: now, expiresAt: new Date(now.getTime() + 1_800_000) } });
    return { token: capability.token, id };
  };
  beforeAll(async () => {
    db = new PrismaService(new ConfigService(validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: isolatedDatabaseUrl() })));
    await db.onModuleInit();
  });
  beforeEach(() => {
    keyId = randomUUID().replaceAll('-', ''); provider = new FixtureVerify();
    service = new PhoneVerificationService(db, new PendingContextService(), new RegistrationRateLimits(keyId, Buffer.alloc(32, 7)), provider);
  });
  afterEach(async () => { await db.registrationRateEvent.deleteMany({ where: { keyId } }); });
  afterAll(async () => {
    if (db) { await db.pendingRegistration.deleteMany({ where: { id: { in: [...pendingIds] } } }); await db.onModuleDestroy(); }
  });
  it('keeps delivery pending, commits trusted approval once and never creates a session', async () => {
    const context = await pending();
    const response = await service.request(context.token, '+919876543220', 'fixture-ip');
    expect(Object.keys(response).sort()).toEqual(['expiresAt', 'resendAt']);
    expect((await db.pendingRegistration.findUniqueOrThrow({ where: { id: context.id } })).phoneVerifiedAt).toBeNull();
    await expect(service.check(context.token, '123456', 'fixture-ip')).rejects.toMatchObject({ status: 401 });
    provider.outcome = 'approved';
    expect(await service.check(context.token, '123456', 'fixture-ip')).toEqual({ verified: true });
    expect(await service.check(context.token, '123456', 'fixture-ip')).toEqual({ verified: true });
    expect(provider.checks).toBe(2);
    const challenge = await db.phoneChallenge.findFirstOrThrow({ where: { pendingId: context.id } });
    expect(challenge).toMatchObject({ status: 'APPROVED', failedChecks: 1 });
    expect(JSON.stringify(challenge)).not.toContain('123456');
    expect(await db.session.count({ where: { userId: context.id } })).toBe(0);
  });
  it('persists all five failed checks and blocks a sixth provider check', async () => {
    const context = await pending(); await service.request(context.token, '+919876543221', 'fixture-ip');
    for (let attempt = 0; attempt < 5; attempt++) await expect(service.check(context.token, '123456', 'fixture-ip')).rejects.toMatchObject({ status: 401 });
    await expect(service.check(context.token, '123456', 'fixture-ip')).rejects.toMatchObject({ status: 429 });
    expect(provider.checks).toBe(5);
    expect((await db.phoneChallenge.findFirstOrThrow({ where: { pendingId: context.id } })).failedChecks).toBe(5);
  });
  it('charges indeterminate checks and requires cancellation before fresh proof', async () => {
    const context = await pending(); await service.request(context.token, '+919876543222', 'fixture-ip');
    provider.outcome = 'unavailable';
    await expect(service.check(context.token, '123456', 'fixture-ip')).rejects.toMatchObject({ status: 503 });
    expect(await db.phoneChallenge.findFirst({ where: { pendingId: context.id }, select: { status: true, failedChecks: true } })).toEqual({ status: 'INDETERMINATE', failedChecks: 1 });
    await expect(service.check(context.token, '123456', 'fixture-ip')).rejects.toMatchObject({ status: 409 });
    await service.restart(context.token, 'fixture-ip');
    // Restart cannot bypass the global phone cooldown.
    await expect(service.request(context.token, '+919876543222', 'fixture-ip')).rejects.toMatchObject({ status: 429 });
    expect((await db.pendingRegistration.findUniqueOrThrow({ where: { id: context.id } })).phoneVerifiedAt).toBeNull();
  });
  it('prevents cross-context adoption and overlapping send effects', async () => {
    const first = await pending(); const second = await pending();
    const results = await Promise.allSettled([service.request(first.token, '+919876543223', 'fixture-ip'), service.request(second.token, '+919876543223', 'fixture-ip')]);
    expect(results.filter((value) => value.status === 'fulfilled')).toHaveLength(1);
    expect(provider.sends).toBe(1);
    const unbound = (await db.pendingRegistration.findUniqueOrThrow({ where: { id: first.id } })).phone ? second : first;
    await expect(service.check(unbound.token, '123456', 'fixture-ip')).rejects.toMatchObject({ status: 401 });
    const rows = await db.registrationRateEvent.findMany({ where: { keyId }, select: { bucketHash: true } });
    expect(rows).toHaveLength(3); // Phone hourly/cooldown policies share one event.
    expect(JSON.stringify(rows)).not.toContain('fixture-ip');
    expect(JSON.stringify(rows)).not.toContain('+919876543223');
  });
});
