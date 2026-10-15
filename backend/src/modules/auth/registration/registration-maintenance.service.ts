import { PrismaService } from '../../../database/prisma.service';
import { registrationTime } from '../../../database/registration-transaction';

export class RegistrationMaintenance {
  constructor(private readonly database: PrismaService) {}

  // Backend operational entry point, never an unauthenticated HTTP operation.
  // Deployment must run/monitor this at least hourly. Batch thresholds leave an
  // hour of headroom for the approved maximum retention, not a longer default.
  async purge(scope?: { pendingIds: readonly string[]; rateKeyIds: readonly string[] }): Promise<void> {
    await this.database.$transaction(async (tx) => {
      const now = await registrationTime(tx);
      const expiredProof = new Date(now.getTime() - 23 * 3_600_000);
      // Optional narrowing supports isolated rehearsals; it can only reduce the
      // affected set, never weaken an identity or extend a proof's validity.
      const children = scope ? { pendingId: { in: [...scope.pendingIds] } } : {};
      const contexts = scope ? { id: { in: [...scope.pendingIds] } } : {};
      const rates = scope ? { keyId: { in: [...scope.rateKeyIds] } } : {};
      await tx.registrationRateEvent.deleteMany({ where: { ...rates, createdAt: { lt: new Date(now.getTime() - 24 * 3_600_000) } } });
      await tx.registrationEmailAuthorization.updateMany({ where: { ...children, status: 'ACTIVE', expiresAt: { lte: now } }, data: { status: 'EXPIRED', tokenHash: null } });
      // Creation precedes any terminal transition; expiring metadata from the
      // earlier time preserves the retention upper bound without another index.
      await tx.registrationEmailAuthorization.deleteMany({ where: { ...children, expiresAt: { lt: new Date(expiredProof.getTime() + 300_000) } } });
      await tx.phoneChallenge.deleteMany({ where: { ...children, expiresAt: { lt: new Date(expiredProof.getTime() + 600_000) } } });
      // Purge completed/abandoned contexts; never delete a stable user/session.
      await tx.pendingRegistration.deleteMany({ where: { ...contexts, OR: [
        { status: 'COMPLETED', expiresAt: { lt: new Date(expiredProof.getTime() + 1_800_000) } },
        { expiresAt: { lt: new Date(now.getTime() - (7 * 86_400_000 - 3_600_000)) } },
      ] } });
    });
  }
}
