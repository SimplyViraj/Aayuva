import { CanActivate, ExecutionContext, Inject, Injectable, ServiceUnavailableException, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import type { Principal, RequestAuthenticator } from './session-authenticator';

export const REQUEST_AUTHENTICATOR = Symbol('REQUEST_AUTHENTICATOR');
export const PUBLIC_OPERATIONS = Symbol('PUBLIC_OPERATIONS');
const PUBLIC_OPERATION = 'publicOperation';
const principals = new WeakMap<Request, Principal>();

export function PublicOperation(id: string): ReturnType<typeof SetMetadata> { return SetMetadata(PUBLIC_OPERATION, id); }
export function isReviewedPublic(context: ExecutionContext, reflector: Reflector, allowed: ReadonlySet<string>): boolean {
  const id = reflector.getAllAndOverride<string | undefined>(PUBLIC_OPERATION, [context.getHandler(), context.getClass()]);
  return id !== undefined && allowed.has(id);
}
export function requestPrincipal(request: Request): Principal {
  const value = principals.get(request);
  if (!value) throw new UnauthorizedException();
  return value;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector,
    @Inject(REQUEST_AUTHENTICATOR) private readonly authenticator: RequestAuthenticator,
    @Inject(PUBLIC_OPERATIONS) private readonly publicOperations: ReadonlySet<string>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isReviewedPublic(context, this.reflector, this.publicOperations)) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
    if (!token) throw new UnauthorizedException();
    principals.set(request, await this.authenticator.authenticate(token));
    return true;
  }
}

@Injectable()
export class InactiveAuthenticator implements RequestAuthenticator {
  async authenticate(token: string): Promise<Principal> {
    void token;
    // No fixture or guessed keys/policy may be activated by a request/env flag.
    // DEV-018/DEV-023 wire real configuration after their review and issuance gates.
    throw new ServiceUnavailableException();
  }
}
