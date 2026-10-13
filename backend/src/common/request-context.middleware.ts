import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export type ContextRequest = Request & { requestId?: string };

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(request: ContextRequest, response: Response, next: NextFunction): void {
    // Never reflect caller-supplied correlation values: they may contain secrets.
    request.requestId = randomUUID();
    response.setHeader('X-Request-Id', request.requestId);
    next();
  }
}
