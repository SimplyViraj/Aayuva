import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { BackendEnvironment, ConfigurationError } from '../config/environment';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService<BackendEnvironment, true>) {
    const connectionString = config.get('DATABASE_URL', { infer: true });
    if (!connectionString) throw new ConfigurationError(['DATABASE_URL']);
    super({ adapter: new PrismaPg({ connectionString }) });
  }
  async onModuleInit(): Promise<void> { await this.$connect(); }
  async onModuleDestroy(): Promise<void> { await this.$disconnect(); }
}
