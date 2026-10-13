import { Body, Controller, Get, INestApplication, Post, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString, Length } from 'class-validator';
import request from 'supertest';
import { CommonModule } from '../src/common/common.module';
import { SafeLogger } from '../src/common/safe-logger.service';

class FixtureDto {
  @IsString()
  @Length(1, 10)
  label!: string;
}

// This controller is compiled only in tests and is never imported by AppModule.
@Controller('fixture')
class FixtureController {
  @Post()
  submit(@Body() input: FixtureDto): { label: string } { return { label: input.label }; }

  @Get('provider-error')
  providerError(): never { throw new ServiceUnavailableException('provider-secret-canary'); }

  @Get('internal-error')
  internalError(): never { throw new Error('password-secret-canary'); }
}

describe('validation, exceptions and diagnostics — VAL-012 foundation', () => {
  let app: INestApplication;
  let output: string[];

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [CommonModule], controllers: [FixtureController] }).compile();
    app = module.createNestApplication({ logger: false });
    await app.init();
  });

  beforeEach(() => {
    output = [];
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => { output.push(String(chunk)); return true; });
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => { await app.close(); });

  it('accepts a valid DTO and rejects forged authority fields', async () => {
    await request(app.getHttpServer()).post('/fixture').send({ label: 'safe' }).expect(201, { label: 'safe' });
    const response = await request(app.getHttpServer()).post('/fixture').send({ label: 'safe', role: 'ADMIN', password: 'password-secret-canary' }).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
    expect(JSON.stringify(response.body)).not.toContain('password-secret-canary');
    expect(output.join('')).not.toContain('password-secret-canary');
  });

  it.each([{}, { label: 42 }, { label: '' }, { label: 'more-than-ten-characters' }])('rejects invalid structure/types/bounds without implicit coercion', async (body) => {
    await request(app.getHttpServer()).post('/fixture').send(body).expect(400);
  });

  it.each([['provider-error', 503], ['internal-error', 500]] as const)('sanitizes %s and supplies a generated request ID', async (route, status) => {
    const response = await request(app.getHttpServer()).get(`/fixture/${route}`).set('X-Request-Id', 'refresh-secret-canary').expect(status);
    expect(response.body.requestId).toMatch(/^[a-f0-9-]{36}$/);
    expect(response.headers['x-request-id']).toBe(response.body.requestId);
    expect(JSON.stringify(response.body)).not.toMatch(/secret-canary|stack|provider|password/);
    expect(output.join('')).not.toMatch(/secret-canary|stack|provider|password/);
    expect(JSON.parse(output[0] ?? '{}')).toMatchObject({ event: 'http_error', status, requestId: response.body.requestId });
  });

  it('never logs raw framework/provider arguments', () => {
    const logger = new SafeLogger();
    logger.error(new Error('access-secret-canary'));
    logger.log({ password: 'password-secret-canary', otp: 'otp-secret-canary' });
    expect(output.join('')).not.toMatch(/secret-canary|password|otp/);
    expect(output).toHaveLength(2);
  });
});
