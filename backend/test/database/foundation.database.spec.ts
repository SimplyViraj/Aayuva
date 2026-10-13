import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../src/database/prisma.service';
import { validateEnvironment } from '../../src/config/environment';
import { SessionStore } from '../../src/modules/sessions/session-store.service';
import { isolatedDatabaseUrl } from '../../scripts/test-database-url.mjs';
config({ path: '.env.database.local', quiet: true });
describe('PostgreSQL foundation - VAL-015', () => {
  let db: PrismaService;
  const users = new Set<string>();
  beforeAll(async () => {
    const environment = validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: isolatedDatabaseUrl() });
    db = new PrismaService(new ConfigService(environment));
    await db.onModuleInit();
  });
  afterAll(async () => {
    if (db) {
      // Delete only UUIDs created by this suite, children first; never reset a DB.
      await db.session.deleteMany({ where: { userId: { in: [...users] } } });
      await db.user.deleteMany({ where: { id: { in: [...users] } } });
      await db.onModuleDestroy();
    }
  });
  it('enforces identity uniqueness, session foreign keys and restrictive deletion', async () => {
    const id = randomUUID(); users.add(id);
    await db.user.create({ data: { id } });
    await expect(db.user.create({ data: { id } })).rejects.toMatchObject({ code: 'P2002' });
    await expect(db.session.create({ data: { userId: randomUUID(), expiresAt: new Date('2100-01-01') } })).rejects.toMatchObject({ code: 'P2003' });
    await db.session.create({ data: { userId: id, expiresAt: new Date('2100-01-01') } });
    await expect(db.user.delete({ where: { id } })).rejects.toMatchObject({ code: 'P2003' });
  });
  it('rolls back inseparable writes after an interruption', async () => {
    const id = randomUUID(); users.add(id);
    await expect(db.$transaction(async (tx) => {
      await tx.user.create({ data: { id } });
      await tx.session.create({ data: { userId: id, expiresAt: new Date('2100-01-01') } });
      throw new Error('synthetic transaction interruption');
    })).rejects.toThrow('synthetic transaction interruption');
    expect(await db.user.findUnique({ where: { id } })).toBeNull();
    expect(await db.session.count({ where: { userId: id } })).toBe(0);
  });
  it('has one conditional revocation winner under concurrent writes', async () => {
    const id = randomUUID(); users.add(id);
    await db.user.create({ data: { id } });
    const session = await db.session.create({ data: { userId: id, expiresAt: new Date('2100-01-01') } });
    const results = await Promise.all([0, 1].map(() => db.session.updateMany({
      where: { id: session.id, revokedAt: null }, data: { revokedAt: new Date() },
    })));
    expect(results.reduce((count, result) => count + result.count, 0)).toBe(1);
    expect((await db.session.findUniqueOrThrow({ where: { id: session.id } })).revokedAt).not.toBeNull();
  });
  it('binds repository revocation to ownership and preserves its first timestamp', async () => {
    const id = randomUUID(); users.add(id);
    await db.user.create({ data: { id } });
    const session = await db.session.create({ data: { userId: id, expiresAt: new Date('2100-01-01') } });
    const store = new SessionStore(db);
    const first = new Date('2026-10-13T00:00:00Z');
    await store.revoke(randomUUID(), session.id, first);
    expect((await store.find(session.id))?.revokedAt).toBeNull();
    await store.revoke(id, session.id, first);
    await store.revoke(id, session.id, new Date('2026-10-14T00:00:00Z'));
    expect((await store.find(session.id))?.revokedAt).toEqual(first);
  });
});
