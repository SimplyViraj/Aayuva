import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IdentityService } from '../../identity/identity.service';
import { canonicalEmail, canonicalSubject, displayName } from '../../identity/normalization';
import type { RegistrationMethod } from '../../../generated/prisma/client';
import { PendingContextService } from './pending-context.service';
import { RegistrationRateLimits } from './rate-limits.service';
import { capabilityHash, issueCapability } from './capabilities';
import { registrationTime } from '../../../database/registration-transaction';

export interface TrustedPrimaryIdentity { method: RegistrationMethod; subject: string; displayName?: string; verifiedEmail?: string }
export interface RegistrationStatus {
  stage: 'onboarding' | 'completed'; displayName: string | null; phone: string | null;
  email: string | null; phoneVerified: boolean; emailVerified: boolean; emailRequired: boolean; expiresAt: string;
}

@Injectable()
export class AccountRegistrationService {
  constructor(private readonly database: PrismaService, private readonly contexts: PendingContextService,
    private readonly identities: IdentityService, private readonly limits: RegistrationRateLimits) {}

  // Evidence comes only from a reviewed backend verifier/callback/guard. A client
  // DTO never supplies trusted method/subject/verification state or role.
  async begin(evidence: TrustedPrimaryIdentity, profile: { displayName: string; email?: string }, ip: string): Promise<{ token: string; expiresAt: string }> {
    const subject = canonicalSubject(evidence.method, evidence.subject);
    const name = displayName(profile.displayName || evidence.displayName || '');
    const email = evidence.method === 'EMAIL_PASSWORD' ? canonicalEmail(profile.email ?? '')
      : evidence.verifiedEmail ? canonicalEmail(evidence.verifiedEmail) : null;
    if (evidence.method === 'EMAIL_PASSWORD' && subject !== email) throw new ConflictException();
    if (await this.identities.resolveVerifiedMethod(evidence.method, subject)) throw new ConflictException();
    const capability = issueCapability('pending_registration');
    const pending = await this.database.$transaction(async (tx) => {
      await this.limits.reserve(tx, this.limits.begin(ip));
      const now = await registrationTime(tx);
      return tx.pendingRegistration.create({ data: {
        capabilityHash: capability.hash, primaryMethod: evidence.method, primarySubject: subject,
        displayName: name, email, emailVerifiedAt: evidence.verifiedEmail && evidence.method !== 'EMAIL_PASSWORD' ? now : null,
        createdAt: now, expiresAt: new Date(now.getTime() + 1_800_000),
      }, select: { expiresAt: true } });
    });
    return { token: capability.token, expiresAt: pending.expiresAt.toISOString() };
  }

  async profile(token: string, input: string): Promise<void> {
    const name = displayName(input);
    await this.database.$transaction(async (tx) => {
      const { pending } = await this.contexts.authorize(tx, token);
      await tx.pendingRegistration.update({ where: { id: pending.id }, data: { displayName: name } });
    });
  }

  async status(token: string): Promise<RegistrationStatus> {
    const hash = capabilityHash('pending_registration', token);
    return this.database.$transaction(async (tx) => {
      const now = await registrationTime(tx);
      const pending = await tx.pendingRegistration.findUnique({ where: { capabilityHash: hash }, select: {
        status: true, displayName: true, phone: true, phoneVerifiedAt: true,
        email: true, emailVerifiedAt: true, primaryMethod: true, expiresAt: true,
      } });
      if (!pending || pending.status === 'CANCELLED' || pending.expiresAt <= now) throw new UnauthorizedException();
      return { stage: pending.status === 'COMPLETED' ? 'completed' : 'onboarding', displayName: pending.displayName,
        phone: pending.phone, email: pending.email, phoneVerified: !!pending.phoneVerifiedAt,
        emailVerified: !!pending.emailVerifiedAt, emailRequired: pending.primaryMethod === 'EMAIL_PASSWORD', expiresAt: pending.expiresAt.toISOString() };
    });
  }

  async complete(token: string): Promise<{ completed: true }> {
    const hash = capabilityHash('pending_registration', token);
    const pending = await this.database.pendingRegistration.findUnique({ where: { capabilityHash: hash }, select: { id: true } });
    if (!pending) throw new UnauthorizedException();
    // Capability, expiry, proof and cancellation are rechecked under the same
    // transaction/lock as the identity claim. Completion never issues a session.
    await this.identities.claimVerifiedPending(pending.id, hash);
    return { completed: true };
  }

  async cancel(token: string): Promise<void> {
    await this.database.$transaction(async (tx) => {
      const { pending } = await this.contexts.authorize(tx, token);
      await tx.pendingRegistration.update({ where: { id: pending.id }, data: { status: 'CANCELLED', capabilityHash: null } });
      await tx.registrationEmailAuthorization.updateMany({ where: { pendingId: pending.id, status: 'ACTIVE' }, data: { status: 'SUPERSEDED', tokenHash: null } });
      // Keep active remote-phone bindings until expiry/reconciliation; local
      // cancellation must not allow another context to adopt its provider SID.
    });
  }
}
