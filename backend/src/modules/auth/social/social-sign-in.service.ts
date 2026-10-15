import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { lockRegistration, registrationTime } from '../../../database/registration-transaction';
import type { SocialPlatform, SocialProvider } from '../../../generated/prisma/client';
import { capabilityHash, issueCapability, socialNonceHash } from '../registration/capabilities';
import { AccountRegistrationService } from '../registration/account-registration.service';
import { RegistrationRateLimits } from '../registration/rate-limits.service';
import { SocialProviderVerifier } from './provider-verifier';
import { SocialSessions, type InitialSession } from './social-sessions.service';
import type { SocialSettings } from './social-settings';

export interface OnboardingResult { kind: 'onboarding'; token: string; expiresAt: string }
export class SocialSignInService {
  constructor(private readonly db: PrismaService, private readonly settings: SocialSettings, private readonly limits: RegistrationRateLimits,
    private readonly verifier: SocialProviderVerifier, private readonly accounts: AccountRegistrationService, private readonly sessions: SocialSessions) {}

  async start(provider: SocialProvider, platform: SocialPlatform, ip: string): Promise<{ token: string; nonce: string; expiresAt: string }> {
    if ((provider === 'GOOGLE' && !this.settings.google) || (provider === 'APPLE' && (!this.settings.apple || platform !== 'IOS'))) throw new ServiceUnavailableException();
    const capability = issueCapability('social_flow'); const nonce = randomBytes(32).toString('hex');
    const expiresAt = await this.db.$transaction(async (tx) => {
      await this.limits.reserve(tx, this.limits.socialStart(ip)); const now = await registrationTime(tx);
      const flow = await tx.socialSignInFlow.create({ data: { capabilityHash: capability.hash, nonceHash: socialNonceHash(nonce), provider, platform, createdAt: now, expiresAt: new Date(now.getTime() + 300_000) }, select: { expiresAt: true } });
      return flow.expiresAt.toISOString();
    });
    return { token: capability.token, nonce, expiresAt };
  }

  async complete(token: string, idToken: string, ip: string, displayName?: string): Promise<OnboardingResult | InitialSession> {
    const hash = capabilityHash('social_flow', token);
    // Attempt reservation commits before external key retrieval/verification.
    const reserved = await this.db.$transaction(async (tx) => {
      await lockRegistration(tx, hash); const now = await registrationTime(tx);
      await this.limits.reserve(tx, this.limits.socialComplete(ip));
      const flow = await tx.socialSignInFlow.findUnique({ where: { capabilityHash: hash } });
      if (!flow || flow.purpose !== 'SIGN_IN' || flow.consumedAt || flow.expiresAt <= now || flow.attempts >= 5) return null;
      await tx.socialSignInFlow.update({ where: { id: flow.id }, data: { attempts: { increment: 1 } } });
      return flow;
    });
    if (!reserved) throw new UnauthorizedException();
    const identity = await this.verifier.verify(reserved.provider, reserved.platform, idToken, reserved.nonceHash);
    return this.db.$transaction(async (tx) => {
      await lockRegistration(tx, hash); const now = await registrationTime(tx);
      const flow = await tx.socialSignInFlow.findUnique({ where: { id: reserved.id } });
      if (!flow || flow.capabilityHash !== hash || flow.purpose !== 'SIGN_IN' || flow.consumedAt || flow.expiresAt <= now || flow.nonceHash !== reserved.nonceHash) throw new UnauthorizedException();
      await lockRegistration(tx, 'identity:' + identity.method + ':' + identity.subject);
      const existing = await tx.userIdentity.findUnique({ where: { method_subject: { method: identity.method, subject: identity.subject } }, select: { userId: true } });
      const result: OnboardingResult | InitialSession = existing ? await this.sessions.issueWithin(tx, existing.userId)
        : { kind: 'onboarding', ...await this.accounts.beginWithin(tx, identity, { displayName: identity.displayName ?? displayName }, ip) };
      const consumedAt = await registrationTime(tx);
      if (flow.expiresAt <= consumedAt) throw new UnauthorizedException();
      await tx.socialSignInFlow.update({ where: { id: flow.id }, data: { consumedAt } });
      return result;
    });
  }

  async purge(scope?: readonly string[]): Promise<void> {
    // Operational entry only; run/monitor at least hourly, leaving one hour of
    // headroom before the approved 24-hour post-expiry retention maximum.
    await this.db.$transaction(async (tx) => {
      const now = await registrationTime(tx);
      const cutoff = new Date(now.getTime() - 23 * 3_600_000);
      await tx.socialSignInFlow.deleteMany({ where: { ...(scope ? { capabilityHash: { in: [...scope] } } : {}), OR: [{ expiresAt: { lt: cutoff } }, { consumedAt: { lt: cutoff } }] } });
    });
  }
}
