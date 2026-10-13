import { PrismaService } from '../../../database/prisma.service';
import { registrationTime } from '../../../database/registration-transaction';

export class RegistrationMaintenance {
  constructor(private readonly database: PrismaService) {}

  // Backend operational entry point, never an unauthenticated HTTP operation.
  // Deployment must run approved retention maintenance regularly and monitor it.
  async purge(scope?: { pendingIds: readonly string[]; rateKeyIds: readonly string[] }): Promise<void> {
    await this.database.$transaction(async (tx) => {
      const now = await registrationTime(tx);
      const expiredProof = new Date(now.getTime() - 86_400_000);
      // Optional narrowing supports isolated rehearsals; it can only reduce the
      // affected set, never weaken an identity or extend a proof's validity.
      const children = scope ? { pendingId: { in: [...scope.pendingIds] } } : {};
      const contexts = scope ? { id: { in: [...scope.pendingIds] } } : {};
      const rates = scope ? { keyId: { in: [...scope.rateKeyIds] } } : {};
      await tx.registrationRateEvent.deleteMany({ where: { ...rates, createdAt: { lt: new Date(now.getTime() - 25 * 3_600_000) } } });
      await tx.registrationEmailAuthorization.updateMany({ where: { ...children, status: 'ACTIVE', expiresAt: { lte: now } }, data: { status: 'EXPIRED', tokenHash: null } });
      await tx.registrationEmailAuthorization.deleteMany({ where: { ...children, expiresAt: { lt: expiredProof } } });
      await tx.phoneChallenge.deleteMany({ where: { ...children, expiresAt: { lt: expiredProof } } });
      // Purge completed/abandoned contexts; never delete a stable user/session.
      await tx.pendingRegistration.deleteMany({ where: { ...contexts, OR: [
        { status: 'COMPLETED', expiresAt: { lt: expiredProof } },
        // Begin removal after six days, leaving a day for a monitored daily
        // maintenance cadence to satisfy the approved seven-day upper bound.
        { expiresAt: { lt: new Date(now.getTime() - 6 * 86_400_000) } },
      ] } });
    });
  }
}
