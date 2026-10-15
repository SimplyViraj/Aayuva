import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { parse } from 'dotenv';
import request from 'supertest';
import { PrismaService } from '../dist/database/prisma.service.js';
import { createManualServer } from './manual-registration-server.mjs';
import { isolatedDatabaseUrl } from './test-database-url.mjs';

test('paired manual API refuses unpaired/client role claims, limits delivery destinations and completes a fixture member', { timeout: 30_000 }, async () => {
  const fixture = parse(readFileSync('.env.database.local'));
  const fixtureUrl = isolatedDatabaseUrl({ NODE_ENV: 'test', TEST_DATABASE_URL: fixture.TEST_DATABASE_URL });
  const key = 'A'.repeat(43); const keyId = randomUUID().replaceAll('-', '');
  const email = randomUUID() + '@example.test'; const phone = '+919876543226'; const serviceSid = 'VA' + 'a'.repeat(32);
  let sends = 0; let proof;
  const server = await createManualServer({ environment: {}, fixtureUrl, key, phone, email,
    settings: { abuseKeyId: keyId, abuseKey: Buffer.alloc(32, 3) },
    phoneProvider: { serviceSid, send: async (destination) => { sends++; return { sid: 'VE' + randomUUID().replaceAll('-', ''), serviceSid, phone: destination, status: 'pending' }; }, check: async (sid, destination) => ({ sid, serviceSid, phone: destination, status: 'approved' }), cancel: async () => undefined },
    emailProvider: { send: async (_destination, authorization) => { proof = authorization; } },
  });
  const db = server.app.get(PrismaService);
  const api = () => request(server.app.getHttpServer());
  try {
    await api().post('/registration').send({}).expect(401);
    await api().post('/registration').set('X-Manual-Test-Key', 'B'.repeat(43)).send({}).expect(401);
    await api().post('/registration').set('X-Manual-Test-Key', key).send({ role: 'ADMIN' }).expect(400);
    const refused = await api().post('/registration').set('X-Manual-Test-Key', key).send({}).expect(200);
    await api().post('/registration/phone').set('X-Manual-Test-Key', key).auth(refused.body.token, { type: 'bearer' }).send({ phone: '+919876543227' }).expect(503);
    assert.equal(sends, 0);
    const issued = await api().post('/registration').set('X-Manual-Test-Key', key).send({ displayName: 'Manual fixture' }).expect(200);
    const token = issued.body.token;
    await api().get('/registration').auth(token, { type: 'bearer' }).expect(401);
    const paired = (path) => api().post(path).set('X-Manual-Test-Key', key).auth(token, { type: 'bearer' });
    await paired('/registration/phone').send({ phone }).expect(200);
    await paired('/registration/phone/check').send({ code: '123456' }).expect(200);
    await paired('/registration/email').send({ email }).expect(200);
    await paired('/registration/email/check').send({ authorization: proof }).expect(200);
    await paired('/registration/complete').send({}).expect(200);
    const user = await db.user.findUniqueOrThrow({ where: { email }, select: { role: true, status: true, sessions: true } });
    assert.equal(user.role, 'MEMBER'); assert.equal(user.status, 'ACTIVE'); assert.equal(user.sessions.length, 0); assert.equal(sends, 1);
  } finally {
    const own = await db.pendingRegistration.findMany({ where: { primarySubject: email }, select: { id: true, completedUserId: true } });
    const users = own.flatMap((row) => row.completedUserId ? [row.completedUserId] : []);
    await db.pendingRegistration.deleteMany({ where: { id: { in: own.map((row) => row.id) } } });
    await db.userIdentity.deleteMany({ where: { userId: { in: users } } });
    await db.user.deleteMany({ where: { id: { in: users } } });
    await db.registrationRateEvent.deleteMany({ where: { keyId } });
    await server.close();
  }
});
