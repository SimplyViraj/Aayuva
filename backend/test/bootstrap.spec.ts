import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('backend foundation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('boots without exposing an authentication or business endpoint', async () => {
    await request(app.getHttpServer()).get('/auth/login').expect(404);
  });
});
