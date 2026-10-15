import { Body, Controller, Get, HttpCode, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import type { Request } from 'express';
import type { SocialPlatform, SocialProvider } from '../../../generated/prisma/client';
import { PublicOperation, requestPrincipal } from '../request-authentication.guard';
import { RequireAction } from '../../authorization/authorization.guard';
import { SocialSignInService, type OnboardingResult } from './social-sign-in.service';
import { SocialSessions, type InitialSession } from './social-sessions.service';
import { RegistrationHeaders } from '../registration/registration.controller';

export class SocialStartDto {
  @ApiProperty({ enum: ['GOOGLE', 'APPLE'] }) @IsIn(['GOOGLE', 'APPLE']) provider!: SocialProvider;
  @ApiProperty({ enum: ['IOS', 'ANDROID'] }) @IsIn(['IOS', 'ANDROID']) platform!: SocialPlatform;
}
export class SocialCompleteDto {
  @ApiProperty({ minLength: 43, maxLength: 43 }) @Matches(/^[A-Za-z0-9_-]{43}$/) token!: string;
  @ApiProperty({ maxLength: 16384, description: 'Transient provider ID token, never an application access token.' }) @IsString() @MaxLength(16384) @Matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/) idToken!: string;
  @ApiPropertyOptional({ maxLength: 200, description: 'Editable profile input; not identity proof.' }) @IsOptional() @IsString() @MaxLength(200) displayName?: string;
}
export class SocialFlowDto {
  @ApiProperty() token!: string;
  @ApiProperty() nonce!: string;
  @ApiProperty({ format: 'date-time' }) expiresAt!: string;
}
export class SocialResultDto {
  @ApiProperty({ enum: ['onboarding', 'session'] }) kind!: string;
  @ApiPropertyOptional({ description: 'Only for onboarding.' }) token?: string;
  @ApiPropertyOptional({ description: 'Only for a verified ACTIVE member session.' }) accessToken?: string;
  @ApiProperty({ format: 'date-time' }) expiresAt!: string;
}
export class OwnContextDto { @ApiProperty() displayName!: string }

@ApiTags('Social authentication')
@ApiResponse({ status: 400, description: 'Invalid allowlisted input.' })
@ApiResponse({ status: 401, description: 'Invalid/expired evidence or session.' })
@ApiResponse({ status: 409, description: 'Identity collision or active-session cap.' })
@ApiResponse({ status: 429, description: 'Shared rate/attempt budget reached.' })
@ApiResponse({ status: 503, description: 'Method/configuration/provider unavailable.' })
@Controller('auth')
@UseInterceptors(RegistrationHeaders)
export class SocialController {
  constructor(private readonly social: SocialSignInService, private readonly sessions: SocialSessions) {}
  @Post('social/flows') @HttpCode(200) @PublicOperation('social:start') @ApiResponse({ status: 200, type: SocialFlowDto })
  start(@Body() input: SocialStartDto, @Req() request: Request): Promise<SocialFlowDto> {
    return this.social.start(input.provider, input.platform, request.socket.remoteAddress ?? 'unknown-peer');
  }
  @Post('social/complete') @HttpCode(200) @PublicOperation('social:complete') @ApiResponse({ status: 200, type: SocialResultDto })
  @ApiOperation({ description: 'Consumes one bound sign-in flow. New identities receive onboarding only; existing ACTIVE members receive a 15-minute access-only session. No automatic replay.' })
  complete(@Body() input: SocialCompleteDto, @Req() request: Request): Promise<OnboardingResult | InitialSession> {
    return this.social.complete(input.token, input.idToken, request.socket.remoteAddress ?? 'unknown-peer', input.displayName);
  }
  @Get('me') @ApiBearerAuth('access') @RequireAction('auth:self') @ApiResponse({ status: 200, type: OwnContextDto })
  context(@Req() request: Request): Promise<OwnContextDto> { return this.sessions.context(requestPrincipal(request)); }
  @Post('logout') @HttpCode(204) @ApiBearerAuth('access') @RequireAction('auth:self') @ApiResponse({ status: 204 })
  logout(@Req() request: Request): Promise<void> { return this.sessions.logout(requestPrincipal(request)); }
}
