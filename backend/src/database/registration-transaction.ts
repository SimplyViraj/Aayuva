import type { Prisma } from '../generated/prisma/client';

export async function registrationTime(tx: Prisma.TransactionClient): Promise<Date> {
  // PostgreSQL is the shared clock; Prisma has no clock/advisory-lock API.
  const rows = await tx.$queryRaw<Array<{ now: Date }>>`SELECT clock_timestamp() AS now`;
  const now = rows[0]?.now;
  if (!now || !Number.isFinite(now.getTime())) throw new Error('Authoritative time unavailable.');
  return now;
}

export async function lockRegistration(tx: Prisma.TransactionClient, pendingId: string): Promise<void> {
  // Parameterized, transaction-scoped lock; deterministic ordering is required
  // when a caller also locks rate buckets. No session lock survives a rollback.
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${pendingId}, 0))::text`;
}
