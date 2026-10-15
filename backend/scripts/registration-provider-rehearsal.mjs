import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { parse } from 'dotenv';
import { isolatedDatabaseUrl } from './test-database-url.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Secrets are entered only in a real local terminal. Never accept codes through
// arguments, environment variables, files, piped input or the chat transcript.
export function readPrivateLine(prompt, input = process.stdin, output = process.stdout) {
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
    return Promise.reject(new Error('Private input requires a local terminal.'));
  }
  return new Promise((resolve, reject) => {
    let value = ''; const previousRaw = Boolean(input.isRaw); const wasPaused = input.isPaused();
    const cleanup = () => {
      input.removeListener('data', receive); input.removeListener('end', interrupted); input.removeListener('error', interrupted);
      input.setRawMode(previousRaw); if (wasPaused) input.pause(); output.write('\n');
    };
    const interrupted = () => { value = ''; cleanup(); reject(new Error('Private input interrupted.')); };
    const receive = (chunk) => {
      for (const character of chunk.toString('utf8')) {
        if (['\u0003', '\u0004', '\u001b'].includes(character)) { interrupted(); return; }
        if (character === '\r' || character === '\n') { const answer = value; value = ''; cleanup(); resolve(answer); return; }
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else if (character >= ' ' && character <= '~') value += character;
        if (value.length > 4096) { interrupted(); return; }
      }
    };
    output.write(prompt);
    input.setRawMode(true); input.on('data', receive); input.once('end', interrupted); input.once('error', interrupted); input.resume();
  });
}

export function emailAuthorization(value, verificationUrl) {
  if (/^[A-Za-z0-9_-]{43}$/.test(value)) return value;
  let link; let expected;
  try { link = new URL(value); expected = new URL(verificationUrl); }
  catch { throw new Error('Invalid verification link.'); }
  const authorization = link.searchParams.get('authorization');
  if (link.protocol !== expected.protocol || link.hostname !== expected.hostname || link.port !== expected.port || link.pathname !== expected.pathname || link.username || link.password || link.hash || [...link.searchParams.keys()].length !== 1 || !authorization || !/^[A-Za-z0-9_-]{43}$/.test(authorization)) {
    throw new Error('Invalid verification link.');
  }
  return authorization;
}

async function main() {
  const mode = process.argv[2] ?? '--preflight';
  if (process.argv.length > 3 || !['--preflight', '--live'].includes(mode)) throw new Error('Use --preflight or --live only.');
  if (mode === '--live' && (!process.stdin.isTTY || !process.stdout.isTTY)) throw new Error('Live rehearsal requires a local terminal.');
  const raw = parse(readFileSync(path.join(root, '.env')));
  const fixture = parse(readFileSync(path.join(root, '.env.database.local')));
  // Ambient/production DATABASE_URL is never used, even when present in .env.
  const databaseUrl = isolatedDatabaseUrl({ NODE_ENV: 'test', TEST_DATABASE_URL: fixture.TEST_DATABASE_URL });
  const { ConfigService } = await import('@nestjs/config');
  const { validateEnvironment } = await import('../dist/config/environment.js');
  const { PrismaService } = await import('../dist/database/prisma.service.js');
  const { registrationSettings } = await import('../dist/modules/auth/registration/registration.module.js');
  const { canonicalPhone, canonicalEmail } = await import('../dist/modules/identity/normalization.js');
  const { IdentityService } = await import('../dist/modules/identity/identity.service.js');
  const { AccountRegistrationService } = await import('../dist/modules/auth/registration/account-registration.service.js');
  const { PendingContextService } = await import('../dist/modules/auth/registration/pending-context.service.js');
  const { RegistrationRateLimits } = await import('../dist/modules/auth/registration/rate-limits.service.js');
  const { PhoneVerificationService } = await import('../dist/modules/auth/registration/phone-verification.service.js');
  const { EmailVerificationService } = await import('../dist/modules/auth/registration/email-verification.service.js');
  const { TwilioVerify } = await import('../dist/modules/auth/providers/twilio-verify.js');
  const { ResendRegistrationEmail } = await import('../dist/modules/auth/providers/resend-registration.js');
  const { capabilityHash } = await import('../dist/modules/auth/registration/capabilities.js');
  if (!raw.TEST_PHONE_NUMBER || !raw.TEST_EMAIL_ADDRESS) throw new Error('Owned test destinations are required.');
  const phone = canonicalPhone(raw.TEST_PHONE_NUMBER); const email = canonicalEmail(raw.TEST_EMAIL_ADDRESS);
  const config = new ConfigService(validateEnvironment({ ...raw, NODE_ENV: 'test', DATABASE_URL: databaseUrl }));
  const settings = registrationSettings(config); const provider = new TwilioVerify(settings); const delivery = new ResendRegistrationEmail(settings);
  const db = new PrismaService(config); const contexts = new PendingContextService();
  const limits = new RegistrationRateLimits(settings.abuseKeyId, settings.abuseKey);
  const accounts = new AccountRegistrationService(db, contexts, new IdentityService(db), limits);
  const phones = new PhoneVerificationService(db, contexts, limits, provider);
  const emails = new EmailVerificationService(db, contexts, limits, delivery);
  let token; let pendingId; let phoneRequested = false;
  try {
    await db.onModuleInit();
    await db.pendingRegistration.findUnique({ where: { id: randomUUID() }, select: { id: true } });
    console.log('PASS: local settings, owned destination formats and guarded fixture schema.');
    if (mode === '--preflight') { console.log('Preflight only: no messages sent and no records written.'); return; }
    const consent = await readPrivateLine('Confirm both destinations are yours. Type SEND to authorize one SMS and one registration email (input hidden): ');
    if (consent !== 'SEND') throw new Error('Rehearsal not authorized.');
    // Controlled primary-evidence substitution is isolated to this rehearsal.
    // No real password check, production route, member creation or session.
    ({ token } = await accounts.begin({ method: 'EMAIL_PASSWORD', subject: email }, { displayName: 'Registration rehearsal', email }, '127.0.0.1'));
    const pending = await db.pendingRegistration.findUniqueOrThrow({ where: { capabilityHash: capabilityHash('pending_registration', token) }, select: { id: true } });
    pendingId = pending.id;
    phoneRequested = true; await phones.request(token, phone, '127.0.0.1');
    console.log('PASS: Twilio accepted the bound SMS request; delivery has not granted access.');
    let code = await readPrivateLine('Enter the received SMS code (input hidden): ');
    try { await phones.check(token, code, '127.0.0.1'); } finally { code = ''; }
    if (!(await accounts.status(token)).phoneVerified) throw new Error('Phone verification not established.');
    console.log('PASS: actual Twilio check and local bound phone transition.');
    await emails.request(token, email, '127.0.0.1');
    console.log('PASS: Resend accepted the registration email; receipt still needs your confirmation.');
    let link = await readPrivateLine('Within five minutes, paste the received verification link (input hidden): ');
    let authorization;
    try { authorization = emailAuthorization(link, settings.verificationUrl); } finally { link = ''; }
    try { await emails.verify(token, authorization, '127.0.0.1'); } finally { authorization = ''; }
    if (!(await accounts.status(token)).emailVerified) throw new Error('Email verification not established.');
    console.log('PASS: received email proof and local single-use email transition.');
    console.log('IT-005 happy-path rehearsal passed. Resend/expiry/failure cases and device evidence remain separate.');
  } finally {
    if (token) {
      let reconciled = !phoneRequested;
      if (phoneRequested) {
        try { await phones.restart(token, '127.0.0.1'); reconciled = true; }
        catch { console.log('Cleanup: unresolved phone binding retained for safe expiry/reconciliation.'); process.exitCode = 1; }
      }
      try {
        await accounts.cancel(token);
        if (reconciled && pendingId) await db.pendingRegistration.deleteMany({ where: { id: pendingId, status: 'CANCELLED', capabilityHash: null } });
      } catch { console.log('Cleanup: context requires expiry/maintenance; no authority granted.'); process.exitCode = 1; }
      // Actual outbound request budgets remain intact across subsequent runs.
      token = undefined;
    }
    await db.onModuleDestroy();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.error('Rehearsal incomplete. Check the last safe stage, provider console/configuration and fixture readiness. No raw error, code, link or credential is displayed.');
    process.exitCode = 1;
  });
}
