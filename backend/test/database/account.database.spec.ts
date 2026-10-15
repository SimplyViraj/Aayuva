import { createHash, randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../src/database/prisma.service';
import { validateEnvironment } from '../../src/config/environment';
import { isolatedDatabaseUrl } from '../../scripts/test-database-url.mjs';
import { IdentityService } from '../../src/modules/identity/identity.service';
config({ path: '.env.database.local', quiet: true });

describe('account schema - DEV-011 / VAL-001, VAL-015, VAL-016, VAL-018', () => {
  let db: PrismaService;
  const users = new Set<string>(); const pending = new Set<string>();
  const hash = (): string => createHash('sha256').update(randomUUID()).digest('hex');
  const createPending = async (): Promise<string> => {
    const id = randomUUID(); pending.add(id);
    const createdAt = new Date();
    await db.pendingRegistration.create({ data: { id, createdAt, expiresAt: new Date(createdAt.getTime() + 1_800_000), capabilityHash: hash(), primaryMethod: 'PHONE', primarySubject: id } });
    return id;
  };
  const claim = async (service: IdentityService, id: string): Promise<{ userId: string }> => {
    const pending = await db.pendingRegistration.findUniqueOrThrow({ where: { id }, select: { capabilityHash: true } });
    return service.claimVerifiedPending(id, pending.capabilityHash!);
  };
  beforeAll(async () => {
    db = new PrismaService(new ConfigService(validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: isolatedDatabaseUrl() })));
    await db.onModuleInit();
  });
  afterAll(async () => {
    if (db) {
      await db.pendingRegistration.deleteMany({ where: { id: { in: [...pending] } } });
      await db.userIdentity.deleteMany({ where: { userId: { in: [...users] } } });
      await db.user.deleteMany({ where: { id: { in: [...users] } } });
      await db.onModuleDestroy();
    }
  });
  it('does not infer member access or verification for foundation identities', async () => {
    const id = randomUUID(); users.add(id);
    const user = await db.user.create({ data: { id } });
    expect(user).toMatchObject({ status: 'ONBOARDING', role: 'MEMBER', phone: null, email: null });
    await expect(db.user.update({ where: { id }, data: { status: 'ACTIVE' } })).rejects.toMatchObject({ code: 'P2039' });
  });
  it('requires paired verified contacts and email/password completion', async () => {
    const id = randomUUID(); users.add(id);
    await expect(db.user.create({ data: { id, phone: '+919876543210' } })).rejects.toMatchObject({ code: 'P2039' });
    await expect(db.user.create({ data: { id, status: 'ACTIVE', displayName: 'Member', primaryMethod: 'EMAIL_PASSWORD', phone: '+919876543210', phoneVerifiedAt: new Date(), completedAt: new Date() } })).rejects.toMatchObject({ code: 'P2039' });
  });
  it('allows repeated unverified destinations without reserving a member contact', async () => {
    const ids = await Promise.all([createPending(), createPending()]);
    await Promise.all(ids.map((id) => db.pendingRegistration.update({ where: { id }, data: { phone: '+919876543210', email: 'pending@example.test' } })));
    expect(await db.pendingRegistration.count({ where: { id: { in: ids } } })).toBe(2);
  });
  it('does not impose an unapproved ten-digit restriction on valid Indian numbering classes', async () => {
    const id = await createPending();
    await expect(db.pendingRegistration.update({ where: { id }, data: { phone: '+9118001234567' } })).resolves.toMatchObject({ phone: '+9118001234567', phoneVerifiedAt: null });
  });
  it('has only one verified contact claimant under concurrent creation', async () => {
    const ids = [randomUUID(), randomUUID()]; ids.forEach((id) => users.add(id));
    const phone = '+9198' + String(BigInt('0x' + hash().slice(0, 10)) % 100_000_000n).padStart(8, '0');
    const results = await Promise.allSettled(ids.map((id) => db.user.create({ data: { id, phone, phoneVerifiedAt: new Date() } })));
    expect(results.filter((value) => value.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((value) => value.status === 'rejected');
    expect(rejected?.status === 'rejected' && rejected.reason).toMatchObject({ code: 'P2002' });
  });
  it('enforces single active phone challenge across contexts and never stores an OTP', async () => {
    const ids = await Promise.all([createPending(), createPending()]);
    const createdAt = new Date(); const phone = '+919123456789';
    const data = { phone, providerServiceSid: 'VA' + 'a'.repeat(32), createdAt, lastRequestedAt: createdAt, expiresAt: new Date(createdAt.getTime() + 600_000) };
    const first = await db.phoneChallenge.create({ data: { ...data, pendingId: ids[0]! } });
    await expect(db.phoneChallenge.create({ data: { ...data, pendingId: ids[1]! } })).rejects.toMatchObject({ code: 'P2002' });
    expect(first).not.toHaveProperty('code'); expect(first).not.toHaveProperty('otpHash');
    await db.phoneChallenge.update({ where: { id: first.id }, data: { status: 'CANCELLED' } });
    await expect(db.phoneChallenge.create({ data: { ...data, pendingId: ids[1]! } })).resolves.toBeDefined();
  });
  it('rejects wrong email purpose/terminal proof retention and duplicate generation', async () => {
    const pendingId = await createPending(); const createdAt = new Date();
    const data = { pendingId, email: 'member@example.test', generation: 1, tokenHash: hash(), createdAt, expiresAt: new Date(createdAt.getTime() + 300_000) };
    await expect(db.registrationEmailAuthorization.create({ data: { ...data, purpose: 'password_reset' } })).rejects.toMatchObject({ code: 'P2039' });
    const proof = await db.registrationEmailAuthorization.create({ data });
    await expect(db.registrationEmailAuthorization.create({ data: { ...data, tokenHash: hash() } })).rejects.toMatchObject({ code: 'P2002' });
    await expect(db.registrationEmailAuthorization.update({ where: { id: proof.id }, data: { status: 'CONSUMED', consumedAt: new Date() } })).rejects.toMatchObject({ code: 'P2039' });
    await db.registrationEmailAuthorization.update({ where: { id: proof.id }, data: { status: 'CONSUMED', consumedAt: new Date(), tokenHash: null } });
  });
  it('never resolves an unverified contact match as a verified primary identity', async () => {
    const id = await createPending();
    await db.pendingRegistration.update({ where: { id }, data: { email: 'unverified@example.test' } });
    expect(await new IdentityService(db).resolveVerifiedMethod('EMAIL_PASSWORD', 'unverified@example.test')).toBeNull();
  });
  it('creates one canonical member for overlapping completion of the same verified context', async () => {
    const id = await createPending(); const service = new IdentityService(db);
    await db.pendingRegistration.update({ where: { id }, data: { primaryMethod: 'GOOGLE', displayName: ' Fixture Member ', phone: '+919876543211', phoneVerifiedAt: new Date() } });
    const results = await Promise.all([claim(service, id), claim(service, id)]);
    results.forEach((result) => users.add(result.userId));
    expect(results[0]).toEqual(results[1]);
    const user = await db.user.findUniqueOrThrow({ where: { id: results[0]!.userId } });
    expect(user).toMatchObject({ role: 'MEMBER', status: 'ACTIVE', displayName: 'Fixture Member', email: null });
    expect(await service.resolveVerifiedMethod('GOOGLE', id)).toEqual({ userId: user.id, status: 'ACTIVE' });
    expect(await db.pendingRegistration.findUnique({ where: { id }, select: { displayName: true, phone: true } })).toEqual({ displayName: null, phone: null });
  });
  it('rolls back conflicting verified-contact claims without merging identities', async () => {
    const ids = await Promise.all([createPending(), createPending()]); const service = new IdentityService(db);
    for (const id of ids) await db.pendingRegistration.update({ where: { id }, data: { primaryMethod: 'APPLE', displayName: 'Member', phone: '+919876543212', phoneVerifiedAt: new Date() } });
    const results = await Promise.allSettled(ids.map((id) => claim(service, id)));
    for (const result of results) if (result.status === 'fulfilled') users.add(result.value.userId);
    expect(results.filter((value) => value.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((value) => value.status === 'rejected')).toHaveLength(1);
    expect(await db.userIdentity.count({ where: { method: 'APPLE', subject: { in: ids } } })).toBe(1);
    expect(await db.pendingRegistration.count({ where: { id: { in: ids }, status: 'ACTIVE' } })).toBe(1);
  });
  it('rejects incomplete or mismatched primary contact proof', async () => {
    const id = await createPending(); const service = new IdentityService(db);
    await expect(claim(service, id)).rejects.toMatchObject({ status: 409 });
    await db.pendingRegistration.update({ where: { id }, data: { primarySubject: '+919876543213', displayName: 'Member', phone: '+919876543214', phoneVerifiedAt: new Date() } });
    await expect(claim(service, id)).rejects.toMatchObject({ status: 409 });
    expect(await db.userIdentity.count({ where: { subject: '+919876543213' } })).toBe(0);
  });
  it('rechecks capability rotation inside the final identity transaction', async () => {
    const id = await createPending(); const service = new IdentityService(db);
    const prior = (await db.pendingRegistration.findUniqueOrThrow({ where: { id } })).capabilityHash!;
    await db.pendingRegistration.update({ where: { id }, data: { capabilityHash: hash(), primaryMethod: 'GOOGLE', displayName: 'Member', phone: '+919876543215', phoneVerifiedAt: new Date() } });
    await expect(service.claimVerifiedPending(id, prior)).rejects.toMatchObject({ status: 401 });
    expect(await db.userIdentity.count({ where: { method: 'GOOGLE', subject: id } })).toBe(0);
  });
});
