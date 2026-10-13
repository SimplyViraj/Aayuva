import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigurationError } from '../../../config/environment';
import { IdentityModule } from '../../identity/identity.module';
import { IdentityService } from '../../identity/identity.service';
import { TwilioVerify } from '../providers/twilio-verify';
import { ResendRegistrationEmail } from '../providers/resend-registration';
import { AccountRegistrationService } from './account-registration.service';
import { PendingContextService } from './pending-context.service';
import { RegistrationRateLimits } from './rate-limits.service';
import { PhoneVerificationService } from './phone-verification.service';
import { EmailVerificationService } from './email-verification.service';
import { RegistrationMaintenance } from './registration-maintenance.service';
import { RegistrationController, RegistrationHeaders } from './registration.controller';
import { InactiveRegistrationIdentityVerifier, REGISTRATION_IDENTITY_VERIFIER, RegistrationIdentityGuard } from './registration-identity.guard';

export const REGISTRATION_SETTINGS = Symbol('REGISTRATION_SETTINGS');
interface Settings { accountSid: string; authToken: string; serviceSid: string; apiKey: string; sender: string; verificationUrl: string; abuseKeyId: string; abuseKey: Buffer }
export function registrationSettings(config: ConfigService): Settings {
  const required = (key: string): string => {
    const value: unknown = config.get(key);
    if (typeof value !== 'string' || !value) throw new ConfigurationError([key]);
    return value;
  };
  const abuseKey = required('REGISTRATION_ABUSE_KEY');
  if (!/^[0-9a-fA-F]{64,128}$/.test(abuseKey) || abuseKey.length % 2) throw new ConfigurationError(['REGISTRATION_ABUSE_KEY']);
  return { accountSid: required('TWILIO_ACCOUNT_SID'), authToken: required('TWILIO_AUTH_TOKEN'), serviceSid: required('TWILIO_VERIFY_SERVICE_SID'), apiKey: required('RESEND_API_KEY'), sender: required('REGISTRATION_EMAIL_SENDER'), verificationUrl: required('REGISTRATION_EMAIL_URL'), abuseKeyId: required('REGISTRATION_ABUSE_KEY_ID'), abuseKey: Buffer.from(abuseKey, 'hex') };
}

// Prepared feature module. AppModule does not import it before reviewed real
// primary authentication/provider activation; no runtime fixture is installed.
@Module({
  imports: [DatabaseModule, IdentityModule], controllers: [RegistrationController],
  providers: [PendingContextService, RegistrationIdentityGuard, RegistrationHeaders,
    { provide: REGISTRATION_IDENTITY_VERIFIER, useClass: InactiveRegistrationIdentityVerifier },
    { provide: REGISTRATION_SETTINGS, useFactory: registrationSettings, inject: [ConfigService] },
    { provide: RegistrationRateLimits, useFactory: (s: Settings): RegistrationRateLimits => new RegistrationRateLimits(s.abuseKeyId, s.abuseKey), inject: [REGISTRATION_SETTINGS] },
    { provide: TwilioVerify, useFactory: (s: Settings): TwilioVerify => new TwilioVerify(s), inject: [REGISTRATION_SETTINGS] },
    { provide: ResendRegistrationEmail, useFactory: (s: Settings): ResendRegistrationEmail => new ResendRegistrationEmail(s), inject: [REGISTRATION_SETTINGS] },
    { provide: PhoneVerificationService, useFactory: (db: PrismaService, ctx: PendingContextService, limits: RegistrationRateLimits, provider: TwilioVerify): PhoneVerificationService => new PhoneVerificationService(db, ctx, limits, provider), inject: [PrismaService, PendingContextService, RegistrationRateLimits, TwilioVerify] },
    { provide: EmailVerificationService, useFactory: (db: PrismaService, ctx: PendingContextService, limits: RegistrationRateLimits, provider: ResendRegistrationEmail): EmailVerificationService => new EmailVerificationService(db, ctx, limits, provider), inject: [PrismaService, PendingContextService, RegistrationRateLimits, ResendRegistrationEmail] },
    { provide: AccountRegistrationService, useFactory: (db: PrismaService, ctx: PendingContextService, identities: IdentityService, limits: RegistrationRateLimits): AccountRegistrationService => new AccountRegistrationService(db, ctx, identities, limits), inject: [PrismaService, PendingContextService, IdentityService, RegistrationRateLimits] },
    { provide: RegistrationMaintenance, useFactory: (db: PrismaService): RegistrationMaintenance => new RegistrationMaintenance(db), inject: [PrismaService] },
  ], exports: [AccountRegistrationService, PhoneVerificationService, EmailVerificationService, RegistrationMaintenance],
})
export class RegistrationModule {}
