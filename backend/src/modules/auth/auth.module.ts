import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard, InactiveAuthenticator, PUBLIC_OPERATIONS, REQUEST_AUTHENTICATOR } from './request-authentication.guard';
import { ACCESS_POLICY, AuthorizationGuard, UnreviewedAccessPolicy } from '../authorization/authorization.guard';
import { REGISTRATION_OPERATIONS } from './registration/registration-operations';
import { SocialSessions } from './social/social-sessions.service';
import type { RequestAuthenticator } from './session-authenticator';
import type { AccessPolicy } from '../authorization/authorization.guard';

@Module({
  providers: [
    { provide: REQUEST_AUTHENTICATOR, useFactory: (sessions?: SocialSessions): RequestAuthenticator => sessions?.authenticator ?? new InactiveAuthenticator(), inject: [{ token: SocialSessions, optional: true }] },
    { provide: PUBLIC_OPERATIONS, useValue: new Set<string>([...REGISTRATION_OPERATIONS, 'social:start', 'social:complete']) },
    { provide: ACCESS_POLICY, useFactory: (sessions?: SocialSessions): AccessPolicy => sessions ? { allows: async (_principal, action): Promise<boolean> => action === 'auth:self' } : new UnreviewedAccessPolicy(), inject: [{ token: SocialSessions, optional: true }] },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
})
export class AuthModule {}
