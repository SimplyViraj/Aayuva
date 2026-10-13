import { createHash, randomBytes } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

export type CapabilityPurpose = 'pending_registration' | 'registration_email';

export function issueCapability(purpose: CapabilityPurpose): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: capabilityHash(purpose, token) };
}

export function capabilityHash(purpose: CapabilityPurpose, token: string): string {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token) || Buffer.from(token, 'base64url').toString('base64url') !== token) throw new UnauthorizedException();
  return createHash('sha256').update('aayuva:' + purpose + '\0').update(token).digest('hex');
}
