import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { networkInterfaces } from 'node:os';
import { parse } from 'dotenv';
import { Global, Module, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { isolatedDatabaseUrl } from './test-database-url.mjs';
import { validateEnvironment } from '../dist/config/environment.js';
import { CommonModule } from '../dist/common/common.module.js';
import { AuthModule } from '../dist/modules/auth/auth.module.js';
import { RegistrationModule, REGISTRATION_SETTINGS } from '../dist/modules/auth/registration/registration.module.js';
import { REGISTRATION_IDENTITY_VERIFIER } from '../dist/modules/auth/registration/registration-identity.guard.js';
import { AccountRegistrationService } from '../dist/modules/auth/registration/account-registration.service.js';
import { PrismaService } from '../dist/database/prisma.service.js';
import { canonicalPhone, canonicalEmail } from '../dist/modules/identity/normalization.js';
import { TwilioVerify } from '../dist/modules/auth/providers/twilio-verify.js';
import { ResendRegistrationEmail } from '../dist/modules/auth/providers/resend-registration.js';
import { createManualEmailFetch } from './manual-email-diagnostics.mjs';

// This isolated test entry is never imported by AppModule. Its primary evidence
// is a fixture; normal authentication and production activation remain gated.
export async function createManualServer({ environment, fixtureUrl, key, phone, email, settings, phoneProvider, emailProvider }) {
  isolatedDatabaseUrl({ NODE_ENV: 'test', TEST_DATABASE_URL: fixtureUrl });
  if (!/^[A-Za-z0-9_-]{43}$/.test(key)) throw new Error('Invalid manual access key.');
  const ownedPhone = canonicalPhone(phone); const ownedEmail = canonicalEmail(email);
  const configuration = new ConfigService(validateEnvironment({ ...environment, NODE_ENV: 'test', DATABASE_URL: fixtureUrl }));
  class ManualConfiguration {}
  Global()(ManualConfiguration);
  Module({ providers: [{ provide: ConfigService, useValue: configuration }], exports: [ConfigService] })(ManualConfiguration);
  const trusted = (request) => {
    const supplied = request.headers['x-manual-test-key'];
    return typeof supplied === 'string' && /^[A-Za-z0-9_-]{43}$/.test(supplied) && timingSafeEqual(Buffer.from(supplied), Buffer.from(key));
  };
  const actualPhone = phoneProvider ?? new TwilioVerify(settings);
  const actualEmail = emailProvider ?? new ResendRegistrationEmail(settings, createManualEmailFetch(globalThis.fetch,
    (diagnostic) => console.log(JSON.stringify({ event: 'manual_email_delivery_failure', ...diagnostic }))));
  const pendingIds = new Set();
  const module = await Test.createTestingModule({ imports: [ManualConfiguration, CommonModule, AuthModule, RegistrationModule] })
    .overrideProvider(REGISTRATION_SETTINGS).useValue(settings)
    .overrideProvider(REGISTRATION_IDENTITY_VERIFIER).useValue({ verify: async (request) => {
      if (!trusted(request)) throw new UnauthorizedException();
      return { method: 'EMAIL_PASSWORD', subject: ownedEmail };
    } })
    .overrideProvider(TwilioVerify).useValue({ serviceSid: actualPhone.serviceSid,
      send: async (destination) => { if (canonicalPhone(destination) !== ownedPhone) throw new BadRequestException(); return actualPhone.send(ownedPhone); },
      check: async (sid, destination, code) => { if (destination !== ownedPhone) throw new BadRequestException(); return actualPhone.check(sid, destination, code); },
      cancel: (sid) => actualPhone.cancel(sid),
    })
    .overrideProvider(ResendRegistrationEmail).useValue({ send: async (destination, proof, id) => {
      if (canonicalEmail(destination) !== ownedEmail) throw new BadRequestException();
      return actualEmail.send(ownedEmail, proof, id);
    } }).compile();
  const app = module.createNestApplication({ logger: false });
  // Every operation requires the ephemeral pairing key, including status and
  // cancellation. Pending credentials alone cannot access this manual server.
  app.useGlobalGuards({ canActivate: (context) => {
    if (!trusted(context.switchToHttp().getRequest())) throw new UnauthorizedException();
    return true;
  } });
  const db = app.get(PrismaService); const accounts = app.get(AccountRegistrationService);
  const originalBegin = accounts.begin.bind(accounts);
  accounts.begin = async (...args) => {
    const issued = await originalBegin(...args);
    const { capabilityHash } = await import('../dist/modules/auth/registration/capabilities.js');
    const pending = await db.pendingRegistration.findUniqueOrThrow({ where: { capabilityHash: capabilityHash('pending_registration', issued.token) }, select: { id: true } });
    pendingIds.add(pending.id); return issued;
  };
  await app.init();
  return { app, close: async () => {
    // Revoke only contexts created by this server. Retain phone bindings and
    // rate records for approved expiry/reconciliation; never delete members.
    try {
      await db.$transaction(async (tx) => {
        await tx.pendingRegistration.updateMany({ where: { id: { in: [...pendingIds] }, status: 'ACTIVE' }, data: { status: 'CANCELLED', capabilityHash: null } });
        await tx.registrationEmailAuthorization.updateMany({ where: { pendingId: { in: [...pendingIds] }, status: 'ACTIVE' }, data: { status: 'SUPERSEDED', tokenHash: null } });
      });
    } finally { await app.close(); }
  } };
}

async function main() {
  if (!process.stdout.isTTY) throw new Error('Start the manual server in your local terminal.');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const environment = parse(readFileSync(path.join(root, '.env')));
  const fixture = parse(readFileSync(path.join(root, '.env.database.local')));
  const fixtureUrl = isolatedDatabaseUrl({ NODE_ENV: 'test', TEST_DATABASE_URL: fixture.TEST_DATABASE_URL });
  const { registrationSettings } = await import('../dist/modules/auth/registration/registration.module.js');
  const settings = registrationSettings(new ConfigService(validateEnvironment({ ...environment, NODE_ENV: 'test', DATABASE_URL: fixtureUrl })));
  const key = randomBytes(32).toString('base64url');
  const server = await createManualServer({ environment, fixtureUrl, key, phone: environment.TEST_PHONE_NUMBER, email: environment.TEST_EMAIL_ADDRESS, settings });
  try { await server.app.listen(3001, '0.0.0.0'); } catch { await server.close(); throw new Error('Manual server could not listen.'); }
  const addresses = Object.values(networkInterfaces()).flat().filter((address) => address?.family === 'IPv4' && !address.internal);
  console.log('Manual registration test API ready on port 3001; isolated database, owned destinations only.');
  for (const address of addresses) console.log('Device API URL: http://' + address.address + ':3001');
  // Intended one-time local credential issuance, not a diagnostic log. Never
  // run this entry through captured tools/logs or share this line in chat.
  process.stdout.write('Private app pairing key (keep local): ' + key + '\n');
  console.log('Start the separate Expo test app, enter its API URL/key, then request messages from the app.');
  let closing = false;
  const close = async () => { if (closing) return; closing = true; clearTimeout(expiry); try { await server.close(); } catch { process.exitCode = 1; } };
  const expiry = setTimeout(() => { console.log('Manual test server expired after 30 minutes.'); void close(); }, 1_800_000);
  process.once('SIGINT', () => { void close(); }); process.once('SIGTERM', () => { void close(); });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Manual server unavailable. Check the guarded fixture and private provider settings; details suppressed.'); process.exitCode = 1; });
}
