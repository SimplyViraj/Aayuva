import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { RegistrationMethod } from '../../generated/prisma/client';
import { canonicalEmail, canonicalPhone, canonicalSubject, displayName } from './normalization';
import { lockRegistration, registrationTime } from '../../database/registration-transaction';

@Injectable()
export class IdentityService {
  constructor(private readonly database: PrismaService) {}

  async resolveVerifiedMethod(method: RegistrationMethod, subject: string): Promise<{ userId: string; status: 'ACTIVE' | 'ONBOARDING' } | null> {
    const value = await this.database.userIdentity.findUnique({
      where: { method_subject: { method, subject: canonicalSubject(method, subject) } },
      select: { user: { select: { id: true, status: true } } },
    });
    return value ? { userId: value.user.id, status: value.user.status } : null;
  }

  // Called only by trusted backend orchestration after authenticating its bound
  // pending capability. No public route accepts a primary subject/verified flag.
  async claimVerifiedPending(pendingId: string, capabilityVerifier: string): Promise<{ userId: string }> {
    try {
      return await this.database.$transaction(async (tx) => {
        await lockRegistration(tx, pendingId);
        const now = await registrationTime(tx);
        const pending = await tx.pendingRegistration.findUnique({ where: { id: pendingId }, select: {
          status: true, capabilityHash: true, primaryMethod: true, primarySubject: true, displayName: true,
          phone: true, phoneVerifiedAt: true, email: true, emailVerifiedAt: true,
          expiresAt: true, completedUserId: true,
        } });
        if (!pending || pending.capabilityHash !== capabilityVerifier || pending.expiresAt <= now || pending.status === 'CANCELLED') throw new UnauthorizedException();
        if (pending.status === 'COMPLETED' && pending.completedUserId) return { userId: pending.completedUserId };
        if (!pending.displayName || !pending.phone || !pending.phoneVerifiedAt || (pending.primaryMethod === 'EMAIL_PASSWORD' && (!pending.email || !pending.emailVerifiedAt))) throw new ConflictException();
        const phone = canonicalPhone(pending.phone);
        const email = pending.emailVerifiedAt && pending.email ? canonicalEmail(pending.email) : null;
        const subject = canonicalSubject(pending.primaryMethod, pending.primarySubject);
        // Primary proof for contact methods must agree with the verified contact.
        if ((pending.primaryMethod === 'PHONE' && subject !== phone) || (pending.primaryMethod === 'EMAIL_PASSWORD' && subject !== email)) throw new ConflictException();
        const existing = await tx.userIdentity.findUnique({ where: { method_subject: { method: pending.primaryMethod, subject } }, select: { id: true } });
        // An existing verified method must take normal sign-in, never a new claim
        // or silent replacement/merge through a registration context.
        if (existing) throw new ConflictException();
        const user = await tx.user.create({ data: {
          status: 'ACTIVE', role: 'MEMBER', displayName: displayName(pending.displayName),
          primaryMethod: pending.primaryMethod, phone, phoneVerifiedAt: pending.phoneVerifiedAt,
          email, emailVerifiedAt: email ? pending.emailVerifiedAt : null, completedAt: now,
          identities: { create: { method: pending.primaryMethod, subject } },
        }, select: { id: true } });
        await tx.pendingRegistration.update({ where: { id: pendingId }, data: {
          status: 'COMPLETED', completedAt: now, completedUserId: user.id,
          // Completed context retains only status/binding until expiry/cleanup.
          displayName: null, phone: null, phoneVerifiedAt: null, email: null, emailVerifiedAt: null,
        } });
        await tx.phoneChallenge.updateMany({ where: { pendingId, status: 'APPROVED' }, data: { status: 'CONSUMED' } });
        await tx.registrationEmailAuthorization.updateMany({ where: { pendingId, status: 'ACTIVE' }, data: { status: 'SUPERSEDED', tokenHash: null } });
        return { userId: user.id };
      });
    } catch (error) {
      if (isIdentityCollision(error)) throw new ConflictException();
      throw error;
    }
  }
}

export function isIdentityCollision(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
