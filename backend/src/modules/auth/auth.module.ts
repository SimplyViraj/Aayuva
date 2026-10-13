import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard, InactiveAuthenticator, PUBLIC_OPERATIONS, REQUEST_AUTHENTICATOR } from './request-authentication.guard';
import { ACCESS_POLICY, AuthorizationGuard, UnreviewedAccessPolicy } from '../authorization/authorization.guard';
import { REGISTRATION_OPERATIONS } from './registration/registration-operations';

@Module({
  providers: [
    { provide: REQUEST_AUTHENTICATOR, useClass: InactiveAuthenticator },
    { provide: PUBLIC_OPERATIONS, useValue: new Set<string>(REGISTRATION_OPERATIONS) },
    { provide: ACCESS_POLICY, useClass: UnreviewedAccessPolicy },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
})
export class AuthModule {}
