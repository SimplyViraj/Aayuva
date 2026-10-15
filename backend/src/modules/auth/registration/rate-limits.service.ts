import { createHmac } from 'node:crypto';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { Prisma, RegistrationOperation } from '../../../generated/prisma/client';
import { registrationTime } from '../../../database/registration-transaction';

interface Bucket { scope: 'ip' | 'phone' | 'email' | 'pending'; value: string; operation: RegistrationOperation; maximum: number; windowSeconds: number }

export class RegistrationRateLimits {
  constructor(private readonly keyId: string, private readonly key: Buffer) {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(keyId) || key.length < 32) throw new Error('Incomplete abuse-control configuration.');
  }

  async reserve(tx: Prisma.TransactionClient, buckets: readonly Bucket[]): Promise<void> {
    const entries = buckets.map((bucket) => ({ ...bucket, hash: createHmac('sha256', this.key).update('registration:' + bucket.scope + '\0' + bucket.value).digest('hex') }));
    // All callers lock context first, then rate buckets in this deterministic
    // order. Locks are shared across processes and released with the transaction.
    for (const hash of [...new Set(entries.map((entry) => entry.hash))].sort()) {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${this.keyId + ':' + hash}, 1))::text`;
    }
    const now = await registrationTime(tx);
    for (const entry of entries) {
      const count = await tx.registrationRateEvent.count({ where: { keyId: this.keyId, bucketHash: entry.hash, operation: entry.operation, createdAt: { gt: new Date(now.getTime() - entry.windowSeconds * 1000) } } });
      if (count >= entry.maximum) throw new HttpException('Rate limit reached.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const unique = new Map(entries.map((entry) => [entry.hash + ':' + entry.operation, entry]));
    await tx.registrationRateEvent.createMany({ data: [...unique.values()].map((entry) => ({ keyId: this.keyId, bucketHash: entry.hash, operation: entry.operation, createdAt: now })) });
  }

  phoneSend(phone: string, pendingId: string, ip: string): Bucket[] {
    return [{ scope: 'phone', value: phone, operation: 'PHONE_SEND', maximum: 1, windowSeconds: 60 },
      { scope: 'phone', value: phone, operation: 'PHONE_SEND', maximum: 5, windowSeconds: 3600 },
      { scope: 'pending', value: pendingId, operation: 'PHONE_SEND', maximum: 5, windowSeconds: 3600 },
      { scope: 'ip', value: ip, operation: 'PHONE_SEND', maximum: 20, windowSeconds: 3600 }];
  }
  phoneCheck(ip: string): Bucket[] { return [{ scope: 'ip', value: ip, operation: 'PHONE_CHECK', maximum: 20, windowSeconds: 60 }]; }
  emailSend(email: string, pendingId: string, ip: string): Bucket[] {
    return [{ scope: 'email', value: email, operation: 'EMAIL_SEND', maximum: 5, windowSeconds: 3600 },
      { scope: 'pending', value: pendingId, operation: 'EMAIL_SEND', maximum: 5, windowSeconds: 3600 },
      { scope: 'ip', value: ip, operation: 'EMAIL_SEND', maximum: 20, windowSeconds: 3600 }];
  }
  emailCheck(pendingId: string, ip: string): Bucket[] { return [{ scope: 'pending', value: pendingId, operation: 'EMAIL_CHECK', maximum: 10, windowSeconds: 60 }, { scope: 'ip', value: ip, operation: 'EMAIL_CHECK', maximum: 20, windowSeconds: 60 }]; }
  begin(ip: string): Bucket[] { return [{ scope: 'ip', value: ip, operation: 'BEGIN', maximum: 5, windowSeconds: 3600 }]; }
  socialStart(ip: string): Bucket[] { return [
    { scope: 'ip', value: ip, operation: 'SOCIAL_START', maximum: 10, windowSeconds: 60 },
    { scope: 'ip', value: ip, operation: 'SOCIAL_START', maximum: 30, windowSeconds: 3600 },
  ]; }
  socialComplete(ip: string): Bucket[] { return [{ scope: 'ip', value: ip, operation: 'SOCIAL_COMPLETE', maximum: 20, windowSeconds: 60 }]; }
}
