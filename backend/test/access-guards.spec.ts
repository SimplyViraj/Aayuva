import { Controller, Get, INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CommonModule } from '../src/common/common.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { PUBLIC_OPERATIONS, PublicOperation, REQUEST_AUTHENTICATOR } from '../src/modules/auth/request-authentication.guard';
import { ACCESS_POLICY, assertStoredOwner, RequireAction } from '../src/modules/authorization/authorization.guard';

// This controller, grant set and opaque token exist only in the test module.
@Controller('fixture-access')
class FixtureController {
  @Get('protected') @RequireAction('fixture:read') protected(): object { return { allowed: true }; }
  @Get('unannotated') unannotated(): object { return { allowed: true }; }
  @Get('reviewed-public') @PublicOperation('fixture:public') public(): object { return { public: true }; }
  @Get('unreviewed-public') @PublicOperation('unknown:public') unreviewed(): object { return { public: true }; }
}
describe('global access safeguards - VAL-010/VAL-012', () => {
  let app: INestApplication;
  const grants = new Set<string>();
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [CommonModule, AuthModule], controllers: [FixtureController] })
      .overrideProvider(REQUEST_AUTHENTICATOR).useValue({ authenticate: async (token: string) => {
        if (token !== 'fixture-valid') throw new UnauthorizedException();
        return Object.freeze({ userId: 'fixture-owner', sessionId: 'fixture-session' });
      } })
      .overrideProvider(PUBLIC_OPERATIONS).useValue(new Set(['fixture:public']))
      .overrideProvider(ACCESS_POLICY).useValue({ allows: async (_principal: unknown, action: string) => grants.has(action) })
      .compile();
    app = module.createNestApplication({ logger: false }); await app.init();
  });
  beforeEach(() => grants.clear());
  afterAll(async () => { await app.close(); });
  it.each([undefined, 'Bearer invalid', 'Bearer fixture-valid extra', 'Basic fixture-valid'])('rejects missing/malformed authentication: %s', async (header) => {
    const call = request(app.getHttpServer()).get('/fixture-access/protected');
    if (header) call.set('Authorization', header);
    await call.expect(401);
  });
  it('separates authenticated denial from authentication failure', async () => {
    await request(app.getHttpServer()).get('/fixture-access/protected').set('Authorization', 'Bearer fixture-valid').expect(403);
    grants.add('fixture:read');
    await request(app.getHttpServer()).get('/fixture-access/protected').set('Authorization', 'Bearer fixture-valid').expect(200);
    grants.clear();
    await request(app.getHttpServer()).get('/fixture-access/protected').set('Authorization', 'Bearer fixture-valid').expect(403);
  });
  it('denies unannotated operations and client-supplied role claims', async () => {
    await request(app.getHttpServer()).get('/fixture-access/unannotated').set('Authorization', 'Bearer fixture-valid').set('X-Role', 'ADMIN').expect(403);
    await request(app.getHttpServer()).get('/fixture-access/protected?role=ADMIN').set('Authorization', 'Bearer fixture-valid').expect(403);
  });
  it('requires an inventoried public operation as well as its annotation', async () => {
    await request(app.getHttpServer()).get('/fixture-access/reviewed-public').expect(200);
    await request(app.getHttpServer()).get('/fixture-access/unreviewed-public').expect(401);
  });
  it('checks ownership against the stored owner', () => {
    const principal = { userId: 'owner', sessionId: 'session' };
    expect(() => assertStoredOwner(principal, 'owner')).not.toThrow();
    expect(() => assertStoredOwner(principal, 'someone-else')).toThrow();
  });
});

describe('production foundation activation gates', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [CommonModule, AuthModule], controllers: [FixtureController] }).compile();
    app = module.createNestApplication({ logger: false }); await app.init();
  });
  afterAll(async () => { await app.close(); });
  it('has no public exception or test authenticator in the real provider wiring', async () => {
    await request(app.getHttpServer()).get('/fixture-access/reviewed-public').expect(401);
    await request(app.getHttpServer()).get('/fixture-access/protected').set('Authorization', 'Bearer fixture-valid').expect(503);
  });
});
