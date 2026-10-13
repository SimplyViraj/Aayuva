import { randomUUID } from 'node:crypto';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from './api-error.dto';
import { ContextRequest } from './request-context.middleware';
import { SafeLogger } from './safe-logger.service';

const PUBLIC_ERRORS: Readonly<Record<number, { code: string; message: string }>> = {
  400: { code: 'VALIDATION_FAILED', message: 'Check the submitted information.' },
  401: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' },
  403: { code: 'ACCESS_DENIED', message: 'You do not have access to this action.' },
  404: { code: 'NOT_FOUND', message: 'The requested operation is unavailable.' },
  409: { code: 'CONFLICT', message: 'The action could not be completed.' },
  422: { code: 'INVALID_OPERATION', message: 'The action could not be completed.' },
  429: { code: 'RATE_LIMITED', message: 'Please try again later.' },
  503: { code: 'SERVICE_UNAVAILABLE', message: 'The service is temporarily unavailable.' },
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: SafeLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<ContextRequest>();
    const response = context.getResponse<Response>();
    const candidate = exception instanceof HttpException ? exception.getStatus() : 500;
    const status = Number.isInteger(candidate) && candidate >= 400 && candidate <= 599 ? candidate : 500;
    const requestId = request.requestId ?? randomUUID();
    const error = PUBLIC_ERRORS[status] ?? (status >= 500
      ? { code: 'INTERNAL_ERROR', message: 'The action could not be completed. Please try again.' }
      : { code: 'INVALID_OPERATION', message: 'The action could not be completed.' });
    const body: ApiErrorResponse = { error, requestId };
    this.logger.event({ event: 'http_error', level: status >= 500 ? 'error' : 'warn', requestId, status });
    if (!response.headersSent) {
      response.setHeader('X-Request-Id', requestId);
      response.status(status).json(body);
    }
  }
}
