import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Principal } from '../auth/session-authenticator';
import { isReviewedPublic, PUBLIC_OPERATIONS, requestPrincipal } from '../auth/request-authentication.guard';

export const ACCESS_POLICY = Symbol('ACCESS_POLICY');
const REQUIRED_ACTION = 'requiredAction';
export interface AccessPolicy { allows(principal: Principal, action: string): Promise<boolean> }
export function RequireAction(action: string): ReturnType<typeof SetMetadata> { return SetMetadata(REQUIRED_ACTION, action); }
export function assertStoredOwner(principal: Principal, storedOwnerId: string): void {
  if (principal.userId !== storedOwnerId) throw new ForbiddenException();
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector,
    @Inject(ACCESS_POLICY) private readonly policy: AccessPolicy,
    @Inject(PUBLIC_OPERATIONS) private readonly publicOperations: ReadonlySet<string>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isReviewedPublic(context, this.reflector, this.publicOperations)) return true;
    const principal = requestPrincipal(context.switchToHttp().getRequest<Request>());
    const action = this.reflector.getAllAndOverride<string | undefined>(REQUIRED_ACTION, [context.getHandler(), context.getClass()]);
    if (!action || !await this.policy.allows(principal, action)) throw new ForbiddenException();
    return true;
  }
}

@Injectable()
export class UnreviewedAccessPolicy implements AccessPolicy {
  async allows(principal: Principal, action: string): Promise<boolean> { void principal; void action; return false; }
}
