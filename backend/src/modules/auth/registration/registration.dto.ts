import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegistrationProfileDto {
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(1, 100)
  displayName!: string;
}
export class BeginRegistrationDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 100, description: 'Collected during onboarding when absent from verified provider profile.' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @Length(1, 100)
  displayName?: string;
  @ApiPropertyOptional({ description: 'Required for email/password primary identity.', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsOptional() @IsEmail() @MaxLength(254)
  email?: string;
}
export class RegistrationPhoneDto {
  @ApiProperty({ description: 'Valid India number; normalized to E.164.', maxLength: 64 })
  @IsString() @MaxLength(64)
  phone!: string;
}
export class RegistrationCodeDto {
  @ApiProperty({ writeOnly: true, minLength: 4, maxLength: 10 })
  @IsString() @Matches(/^[0-9]{4,10}$/)
  code!: string;
}
export class RegistrationEmailDto {
  @ApiProperty({ maxLength: 254 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() @MaxLength(254)
  email!: string;
}
export class RegistrationEmailProofDto {
  @ApiProperty({ writeOnly: true, minLength: 43, maxLength: 43 })
  @IsString() @Matches(/^[A-Za-z0-9_-]{43}$/)
  authorization!: string;
}
export class RegistrationIssuedDto {
  @ApiProperty({ writeOnly: false, description: 'Opaque onboarding-only credential. Never a member access token.' }) token!: string;
  @ApiProperty({ format: 'date-time' }) expiresAt!: string;
}
export class RegistrationChallengeDto {
  @ApiProperty({ format: 'date-time' }) expiresAt!: string;
  @ApiProperty({ format: 'date-time' }) resendAt!: string;
}
export class RegistrationVerifiedDto { @ApiProperty({ enum: [true] }) verified!: true; }
export class RegistrationCompletedDto { @ApiProperty({ enum: [true] }) completed!: true; }
export class RegistrationStatusDto {
  @ApiProperty({ enum: ['onboarding', 'completed'] }) stage!: 'onboarding' | 'completed';
  @ApiProperty({ type: String, nullable: true }) displayName!: string | null;
  @ApiProperty({ type: String, nullable: true }) phone!: string | null;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
  @ApiProperty() phoneVerified!: boolean;
  @ApiProperty() emailVerified!: boolean;
  @ApiProperty() emailRequired!: boolean;
  @ApiProperty({ format: 'date-time' }) expiresAt!: string;
  @ApiProperty({ type: String, nullable: true, format: 'date-time' }) phoneResendAt!: string | null;
  @ApiProperty({ type: String, nullable: true, format: 'date-time' }) emailResendAt!: string | null;
}
