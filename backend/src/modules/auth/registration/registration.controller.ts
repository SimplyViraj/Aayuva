import { Body, CallHandler, Controller, Delete, ExecutionContext, Get, HttpCode, Injectable, NestInterceptor, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiConflictResponse, ApiOkResponse, ApiResponse, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { ApiErrorResponse } from '../../../common/api-error.dto';
import { PublicOperation } from '../request-authentication.guard';
import { AccountRegistrationService } from './account-registration.service';
import { PhoneVerificationService } from './phone-verification.service';
import { EmailVerificationService } from './email-verification.service';
import { registrationIdentity, RegistrationIdentityGuard, registrationToken } from './registration-identity.guard';
import { BeginRegistrationDto, RegistrationChallengeDto, RegistrationCodeDto, RegistrationCompletedDto, RegistrationEmailDto, RegistrationEmailProofDto, RegistrationIssuedDto, RegistrationPhoneDto, RegistrationProfileDto, RegistrationStatusDto, RegistrationVerifiedDto } from './registration.dto';

@Injectable()
export class RegistrationHeaders implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    context.switchToHttp().getResponse<Response>().setHeader('Cache-Control', 'no-store');
    return next.handle();
  }
}
function sourceIp(request: Request): string {
  // Direct-deployment boundary. Forwarded headers are never caller authority;
  // proxied deployment remains disabled until its explicit trust configuration.
  return request.socket.remoteAddress ?? 'unknown-peer';
}

@ApiTags('Registration')
@ApiBearerAuth('onboarding')
@ApiBadRequestResponse({ type: ApiErrorResponse })
@ApiUnauthorizedResponse({ type: ApiErrorResponse })
@ApiConflictResponse({ type: ApiErrorResponse })
@ApiResponse({ status: 429, type: ApiErrorResponse })
@ApiServiceUnavailableResponse({ type: ApiErrorResponse })
@UseInterceptors(RegistrationHeaders)
@Controller('registration')
export class RegistrationController {
  constructor(private readonly accounts: AccountRegistrationService, private readonly phones: PhoneVerificationService, private readonly emails: EmailVerificationService) {}

  @Post() @HttpCode(200) @PublicOperation('registration:begin') @UseGuards(RegistrationIdentityGuard)
  @ApiOkResponse({ type: RegistrationIssuedDto })
  begin(@Req() request: Request, @Body() input: BeginRegistrationDto): Promise<{ token: string; expiresAt: string }> {
    return this.accounts.begin(registrationIdentity(request), input, sourceIp(request));
  }
  @Get() @PublicOperation('registration:status') @ApiOkResponse({ type: RegistrationStatusDto })
  status(@Req() request: Request): Promise<RegistrationStatusDto> { return this.accounts.status(registrationToken(request)); }

  @Patch('profile') @HttpCode(204) @PublicOperation('registration:profile') @ApiResponse({ status: 204 })
  profile(@Req() request: Request, @Body() input: RegistrationProfileDto): Promise<void> { return this.accounts.profile(registrationToken(request), input.displayName); }

  @Post('phone') @HttpCode(200) @PublicOperation('registration:phone:send') @ApiOkResponse({ type: RegistrationChallengeDto })
  phone(@Req() request: Request, @Body() input: RegistrationPhoneDto): Promise<{ expiresAt: Date; resendAt: Date }> { return this.phones.request(registrationToken(request), input.phone, sourceIp(request)); }

  @Post('phone/check') @HttpCode(200) @PublicOperation('registration:phone:check') @ApiOkResponse({ type: RegistrationVerifiedDto })
  phoneCheck(@Req() request: Request, @Body() input: RegistrationCodeDto): Promise<RegistrationVerifiedDto> { return this.phones.check(registrationToken(request), input.code, sourceIp(request)); }

  @Post('phone/restart') @HttpCode(204) @PublicOperation('registration:phone:restart') @ApiResponse({ status: 204 })
  restart(@Req() request: Request): Promise<void> { return this.phones.restart(registrationToken(request), sourceIp(request)); }

  @Post('email') @HttpCode(200) @PublicOperation('registration:email:send') @ApiOkResponse({ type: RegistrationChallengeDto })
  email(@Req() request: Request, @Body() input: RegistrationEmailDto): Promise<{ expiresAt: Date; resendAt: Date }> { return this.emails.request(registrationToken(request), input.email, sourceIp(request)); }

  @Post('email/check') @HttpCode(200) @PublicOperation('registration:email:check') @ApiOkResponse({ type: RegistrationVerifiedDto })
  emailCheck(@Req() request: Request, @Body() input: RegistrationEmailProofDto): Promise<RegistrationVerifiedDto> { return this.emails.verify(registrationToken(request), input.authorization, sourceIp(request)); }

  @Post('complete') @HttpCode(200) @PublicOperation('registration:complete') @ApiOkResponse({ type: RegistrationCompletedDto })
  complete(@Req() request: Request): Promise<RegistrationCompletedDto> { return this.accounts.complete(registrationToken(request)); }

  @Delete() @HttpCode(204) @PublicOperation('registration:cancel') @ApiResponse({ status: 204 })
  cancel(@Req() request: Request): Promise<void> { return this.accounts.cancel(registrationToken(request)); }
}
