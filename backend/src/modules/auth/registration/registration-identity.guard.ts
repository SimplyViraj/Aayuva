import { CanActivate, ExecutionContext, Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { TrustedPrimaryIdentity } from './account-registration.service';

export const REGISTRATION_IDENTITY_VERIFIER = Symbol('REGISTRATION_IDENTITY_VERIFIER');
export interface RegistrationIdentityVerifier { verify(request: Request): Promise<TrustedPrimaryIdentity> }
const identities = new WeakMap<Request, TrustedPrimaryIdentity>();

export function registrationIdentity(request: Request): TrustedPrimaryIdentity {
  const identity = identities.get(request);
  if (!identity) throw new UnauthorizedException();
  return identity;
}
export function registrationToken(request: Request): string {
  const token = request.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
  if (!token) throw new UnauthorizedException();
  return token;
}

@Injectable()
export class RegistrationIdentityGuard implements CanActivate {
  constructor(@Inject(REGISTRATION_IDENTITY_VERIFIER) private readonly verifier: RegistrationIdentityVerifier) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    identities.set(request, Object.freeze(await this.verifier.verify(request)));
    return true;
  }
}

@Injectable()
export class InactiveRegistrationIdentityVerifier implements RegistrationIdentityVerifier {
  async verify(request: Request): Promise<TrustedPrimaryIdentity> {
    void request;
    // DEL-003 supplies real primary authentication. No production fixture or
    // caller-supplied subject/header/verified flag can establish identity here.
    throw new ServiceUnavailableException();
  }
}
