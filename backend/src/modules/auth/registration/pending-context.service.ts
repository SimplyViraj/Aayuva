import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { PendingRegistration, Prisma } from '../../../generated/prisma/client';
import { capabilityHash } from './capabilities';
import { lockRegistration, registrationTime } from '../../../database/registration-transaction';

@Injectable()
export class PendingContextService {
  async authorize(tx: Prisma.TransactionClient, token: string): Promise<{ pending: Pick<PendingRegistration, 'id' | 'capabilityHash' | 'status' | 'expiresAt' | 'primaryMethod' | 'primarySubject' | 'phone' | 'phoneVerifiedAt' | 'email' | 'emailVerifiedAt' | 'emailGeneration' | 'emailLastIssuedAt'>; now: Date }> {
    const hash = capabilityHash('pending_registration', token);
    const reference = await tx.pendingRegistration.findUnique({ where: { capabilityHash: hash }, select: { id: true } });
    if (!reference) throw new UnauthorizedException();
    await lockRegistration(tx, reference.id);
    const now = await registrationTime(tx);
    const pending = await tx.pendingRegistration.findUnique({ where: { id: reference.id }, select: {
      id: true, capabilityHash: true, status: true, expiresAt: true, primaryMethod: true,
      primarySubject: true, phone: true, phoneVerifiedAt: true, email: true, emailVerifiedAt: true,
      emailGeneration: true, emailLastIssuedAt: true,
    } });
    // Re-read under the lock so cancellation/rotation cannot race authorization.
    if (!pending || pending.capabilityHash !== hash || pending.status !== 'ACTIVE' || pending.expiresAt <= now) throw new UnauthorizedException();
    return { pending, now };
  }
}
