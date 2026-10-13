import { ConflictException, HttpException, HttpStatus, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { canonicalEmail } from '../../identity/normalization';
import { PendingContextService } from './pending-context.service';
import { RegistrationRateLimits } from './rate-limits.service';
import { capabilityHash, issueCapability } from './capabilities';
import type { RegistrationEmailDelivery } from '../providers/resend-registration';

export class EmailVerificationService {
  constructor(private readonly database: PrismaService, private readonly contexts: PendingContextService,
    private readonly limits: RegistrationRateLimits, private readonly delivery: RegistrationEmailDelivery) {}

  async request(token: string, input: string, ip: string): Promise<{ expiresAt: Date; resendAt: Date }> {
    const email = canonicalEmail(input); const proof = issueCapability('registration_email');
    const authorization = await this.database.$transaction(async (tx) => {
      const { pending, now } = await this.contexts.authorize(tx, token);
      if (pending.primaryMethod !== 'EMAIL_PASSWORD' || canonicalEmail(pending.primarySubject) !== email || pending.emailVerifiedAt) throw new ConflictException();
      if (await tx.user.findUnique({ where: { email }, select: { id: true } })) throw new ConflictException();
      if (pending.emailLastIssuedAt && now.getTime() < pending.emailLastIssuedAt.getTime() + 30_000) throw new HttpException('Rate limit reached.', HttpStatus.TOO_MANY_REQUESTS);
      await this.limits.reserve(tx, this.limits.emailSend(email, pending.id, ip));
      // Supersede before delivery. An unavailable delivery cannot resurrect an
      // older authorization; plaintext proof is never persisted for retries.
      await tx.registrationEmailAuthorization.updateMany({ where: { pendingId: pending.id, status: 'ACTIVE' }, data: { status: 'SUPERSEDED', tokenHash: null } });
      const generation = pending.emailGeneration + 1;
      await tx.pendingRegistration.update({ where: { id: pending.id }, data: { email, emailVerifiedAt: null, emailGeneration: generation, emailLastIssuedAt: now } });
      return tx.registrationEmailAuthorization.create({ data: {
        pendingId: pending.id, email, tokenHash: proof.hash, generation, createdAt: now,
        expiresAt: new Date(now.getTime() + 300_000),
      } });
    });
    try {
      await this.delivery.send(email, proof.token, authorization.id);
      await this.database.registrationEmailAuthorization.updateMany({ where: { id: authorization.id, status: 'ACTIVE' }, data: { deliveryStatus: 'SENT' } });
    } catch {
      try { await this.database.registrationEmailAuthorization.updateMany({ where: { id: authorization.id, status: 'ACTIVE' }, data: { deliveryStatus: 'INDETERMINATE' } }); }
      catch { /* No local verification or access is granted on delivery failure. */ }
      throw new ServiceUnavailableException();
    }
    return { expiresAt: authorization.expiresAt, resendAt: new Date(authorization.createdAt.getTime() + 30_000) };
  }

  async verify(token: string, authorization: string, ip: string): Promise<{ verified: true }> {
    // Invalid requests still consume the approved context/IP submission budget.
    const reserved = await this.database.$transaction(async (tx) => {
      const { pending } = await this.contexts.authorize(tx, token);
      await this.limits.reserve(tx, this.limits.emailCheck(pending.id, ip));
      return pending.id;
    });
    const hash = capabilityHash('registration_email', authorization);
    return this.database.$transaction(async (tx) => {
      const { pending, now } = await this.contexts.authorize(tx, token);
      if (pending.id !== reserved || pending.primaryMethod !== 'EMAIL_PASSWORD') throw new UnauthorizedException();
      const proof = await tx.registrationEmailAuthorization.findUnique({ where: { tokenHash: hash }, select: { id: true, pendingId: true, email: true, purpose: true, generation: true, status: true, expiresAt: true } });
      if (!proof || proof.pendingId !== pending.id || proof.email !== pending.email || proof.purpose !== 'registration_email' || proof.generation !== pending.emailGeneration || proof.status !== 'ACTIVE' || proof.expiresAt <= now) throw new UnauthorizedException();
      const consumed = await tx.registrationEmailAuthorization.updateMany({ where: { id: proof.id, status: 'ACTIVE', tokenHash: hash }, data: { status: 'CONSUMED', tokenHash: null, consumedAt: now } });
      if (consumed.count !== 1) throw new UnauthorizedException();
      await tx.pendingRegistration.update({ where: { id: pending.id }, data: { emailVerifiedAt: now } });
      return { verified: true };
    });
  }
}
