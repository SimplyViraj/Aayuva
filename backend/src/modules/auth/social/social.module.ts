import { Global, Module, type DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { BackendEnvironment } from '../../../config/environment';
import { CommonModule } from '../../../common/common.module';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { AuthModule } from '../auth.module';
import { RegistrationModule, REGISTRATION_SETTINGS } from '../registration/registration.module';
import { AccountRegistrationService } from '../registration/account-registration.service';
import { RegistrationRateLimits } from '../registration/rate-limits.service';
import { socialSettings, type SocialSettings } from './social-settings';
import { SocialProviderVerifier } from './provider-verifier';
import { SocialSessions } from './social-sessions.service';
import { SocialSignInService } from './social-sign-in.service';
import { SocialController } from './social.controller';
import { RegistrationHeaders } from '../registration/registration.controller';

export const SOCIAL_SETTINGS = Symbol('SOCIAL_SETTINGS');
@Global()
@Module({
  imports: [DatabaseModule, RegistrationModule], controllers: [SocialController],
  providers: [
    RegistrationHeaders,
    { provide: SOCIAL_SETTINGS, useFactory: socialSettings, inject: [ConfigService] },
    { provide: SocialProviderVerifier, useFactory: (settings: SocialSettings): SocialProviderVerifier => new SocialProviderVerifier(settings), inject: [SOCIAL_SETTINGS] },
    { provide: SocialSessions, useFactory: (db: PrismaService, settings: SocialSettings): SocialSessions => new SocialSessions(db, settings), inject: [PrismaService, SOCIAL_SETTINGS] },
    { provide: SocialSignInService, useFactory: (db: PrismaService, settings: SocialSettings, abuse: { abuseKey: Buffer; abuseKeyId: string }, verifier: SocialProviderVerifier, accounts: AccountRegistrationService, sessions: SocialSessions): SocialSignInService =>
      new SocialSignInService(db, settings, new RegistrationRateLimits(abuse.abuseKeyId, abuse.abuseKey), verifier, accounts, sessions),
      inject: [PrismaService, SOCIAL_SETTINGS, REGISTRATION_SETTINGS, SocialProviderVerifier, AccountRegistrationService, SocialSessions] },
  ], exports: [SocialSessions],
})
export class SocialModule {}

@Module({})
class ConfiguredSocialApplication {}
export function socialApplication(environment: BackendEnvironment): DynamicModule {
  return { module: ConfiguredSocialApplication, imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, skipProcessEnv: true, validate: (): BackendEnvironment => environment }),
    CommonModule, AuthModule, SocialModule,
  ] };
}
