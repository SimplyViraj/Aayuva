import { BadRequestException, ConflictException, HttpException, HttpStatus, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { canonicalPhone } from '../../identity/normalization';
import { PendingContextService } from './pending-context.service';
import { RegistrationRateLimits } from './rate-limits.service';
import type { PhoneVerificationProvider } from '../providers/twilio-verify';

const ACTIVE = ['ISSUING', 'PENDING', 'CHECKING', 'APPROVED', 'INDETERMINATE'] as const;
export class PhoneVerificationService {
  constructor(private readonly database: PrismaService, private readonly contexts: PendingContextService,
    private readonly limits: RegistrationRateLimits, private readonly provider: PhoneVerificationProvider) {}

  async request(token: string, input: string, ip: string): Promise<{ expiresAt: Date; resendAt: Date }> {
    const phone = canonicalPhone(input);
    const reservedId = await this.database.$transaction(async (tx) => {
      const { pending } = await this.contexts.authorize(tx, token);
      if (pending.primaryMethod === 'PHONE' && canonicalPhone(pending.primarySubject) !== phone) throw new ConflictException();
      // Persist budgets before contact lookup. Refused collisions must not
      // become an unmetered account-enumeration path through transaction rollback.
      await this.limits.reserve(tx, this.limits.phoneSend(phone, pending.id, ip));
      return pending.id;
    });
    const challenge = await this.database.$transaction(async (tx) => {
      const { pending, now } = await this.contexts.authorize(tx, token);
      if (pending.id !== reservedId) throw new UnauthorizedException();
      if (pending.primaryMethod === 'PHONE' && canonicalPhone(pending.primarySubject) !== phone) throw new ConflictException();
      if (pending.phoneVerifiedAt) throw new ConflictException();
      if (await tx.user.findUnique({ where: { phone }, select: { id: true } })) throw new ConflictException();
      // Terminal/expired contexts cannot reconcile through their capability.
      // Release only after both local expiry and the approved provider validity
      // plus outbound deadline since the last send; never adopt the old SID.
      await tx.phoneChallenge.updateMany({ where: {
        phone, providerServiceSid: this.provider.serviceSid, status: { in: [...ACTIVE] },
        expiresAt: { lte: now }, lastRequestedAt: { lte: new Date(now.getTime() - 610_000) },
        pending: { OR: [{ status: 'CANCELLED' }, { expiresAt: { lte: now } }] },
      }, data: { status: 'EXPIRED' } });
      const current = await tx.phoneChallenge.findFirst({ where: { pendingId: pending.id, status: { in: [...ACTIVE] } } });
      if (current && (current.phone !== phone || current.providerServiceSid !== this.provider.serviceSid || current.status !== 'PENDING' || current.expiresAt <= now || current.failedChecks >= 5)) throw new ConflictException();
      if (current && now.getTime() < current.lastRequestedAt.getTime() + 60_000) throw new HttpException('Rate limit reached.', HttpStatus.TOO_MANY_REQUESTS);
      await tx.pendingRegistration.update({ where: { id: pending.id }, data: { phone, phoneVerifiedAt: null } });
      if (current) return tx.phoneChallenge.update({ where: { id: current.id }, data: { status: 'ISSUING', lastRequestedAt: now } });
      return tx.phoneChallenge.create({ data: { pendingId: pending.id, phone, providerServiceSid: this.provider.serviceSid, createdAt: now, lastRequestedAt: now, expiresAt: new Date(Math.min(now.getTime() + 600_000, pending.expiresAt.getTime())) } });
    }).catch((error: unknown) => {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ConflictException();
      throw error;
    });
    try {
      const result = await this.provider.send(phone);
      if (result.status !== 'pending' || result.phone !== phone || result.serviceSid !== challenge.providerServiceSid || (challenge.providerSid && result.sid !== challenge.providerSid)) throw new ServiceUnavailableException();
      await this.database.$transaction(async (tx) => {
        const { pending, now } = await this.contexts.authorize(tx, token);
        if (pending.id !== challenge.pendingId || pending.phone !== phone || challenge.expiresAt <= now) throw new ConflictException();
        const updated = await tx.phoneChallenge.updateMany({ where: { id: challenge.id, status: 'ISSUING' }, data: { providerSid: result.sid, status: 'PENDING' } });
        if (updated.count !== 1) throw new ConflictException();
      });
      return { expiresAt: challenge.expiresAt, resendAt: new Date(challenge.lastRequestedAt.getTime() + 60_000) };
    } catch {
      await this.markIndeterminate(challenge.id, 'ISSUING');
      throw new ServiceUnavailableException();
    }
  }

  async check(token: string, code: string, ip: string): Promise<{ verified: true }> {
    if (typeof code !== 'string' || !/^[0-9]{4,10}$/.test(code)) throw new BadRequestException();
    const challenge = await this.database.$transaction(async (tx) => {
      const { pending, now } = await this.contexts.authorize(tx, token);
      const current = await tx.phoneChallenge.findFirst({ where: { pendingId: pending.id, status: { in: [...ACTIVE] } } });
      if (!current || current.phone !== pending.phone || current.providerServiceSid !== this.provider.serviceSid || current.expiresAt <= now) throw new UnauthorizedException();
      if (current.status === 'APPROVED' && pending.phoneVerifiedAt) return null;
      if (current.status !== 'PENDING' || !current.providerSid) throw new ConflictException();
      if (current.failedChecks >= 5) throw new HttpException('Rate limit reached.', HttpStatus.TOO_MANY_REQUESTS);
      await this.limits.reserve(tx, this.limits.phoneCheck(ip));
      // Reservation persists even if the provider times out or the process dies.
      return tx.phoneChallenge.update({ where: { id: current.id }, data: { failedChecks: { increment: 1 }, status: 'CHECKING' } });
    });
    if (!challenge) return { verified: true };
    let approved: boolean;
    try {
      const result = await this.provider.check(challenge.providerSid!, challenge.phone, code);
      if (result.sid !== challenge.providerSid || result.phone !== challenge.phone || result.serviceSid !== challenge.providerServiceSid) throw new ServiceUnavailableException();
      approved = result.status === 'approved';
      await this.database.$transaction(async (tx) => {
        const { pending, now } = await this.contexts.authorize(tx, token);
        if (pending.id !== challenge.pendingId || pending.phone !== challenge.phone || challenge.expiresAt <= now) throw new ConflictException();
        const updated = await tx.phoneChallenge.updateMany({ where: { id: challenge.id, status: 'CHECKING', providerSid: challenge.providerSid }, data: approved
          ? { status: 'APPROVED', approvedAt: now, failedChecks: { decrement: 1 } }
          : { status: 'PENDING' } });
        if (updated.count !== 1) throw new ConflictException();
        if (approved) await tx.pendingRegistration.update({ where: { id: pending.id }, data: { phoneVerifiedAt: now } });
      });
    } catch {
      await this.markIndeterminate(challenge.id, 'CHECKING');
      throw new ServiceUnavailableException();
    }
    if (!approved) throw new UnauthorizedException();
    return { verified: true };
  }

  async restart(token: string, ip: string): Promise<void> {
    const challenge = await this.database.$transaction(async (tx) => {
      const { pending, now } = await this.contexts.authorize(tx, token);
      const current = await tx.phoneChallenge.findFirst({ where: { pendingId: pending.id, status: { in: [...ACTIVE] } } });
      if (!current) return null;
      if (current.providerServiceSid !== this.provider.serviceSid) throw new ServiceUnavailableException();
      // A lost send has no safely known SID. Wait through provider validity and
      // the approved outbound deadline rather than adopting another flow's SID.
      if (!current.providerSid && now.getTime() < current.lastRequestedAt.getTime() + 610_000) throw new ConflictException();
      // Recovery shares the phone-operation IP budget; it cannot become an
      // unlimited provider-cancellation route. No entered-code failure is added.
      await this.limits.reserve(tx, this.limits.phoneCheck(ip));
      await tx.phoneChallenge.update({ where: { id: current.id }, data: { status: 'INDETERMINATE' } });
      return current;
    });
    if (!challenge) return;
    try { if (challenge.providerSid) await this.provider.cancel(challenge.providerSid); }
    catch { throw new ServiceUnavailableException(); }
    await this.database.$transaction(async (tx) => {
      const { pending } = await this.contexts.authorize(tx, token);
      const updated = await tx.phoneChallenge.updateMany({ where: { id: challenge.id, status: 'INDETERMINATE' }, data: { status: 'CANCELLED' } });
      if (updated.count !== 1) throw new ConflictException();
      await tx.pendingRegistration.update({ where: { id: pending.id }, data: { phoneVerifiedAt: null } });
    });
  }

  private async markIndeterminate(id: string, expected: 'ISSUING' | 'CHECKING'): Promise<void> {
    try { await this.database.phoneChallenge.updateMany({ where: { id, status: expected }, data: { status: 'INDETERMINATE' } }); }
    catch { /* Unavailable state never grants access; persisted reservation remains. */ }
  }
}
