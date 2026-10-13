import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
// Imported by consumers when implemented; no seed, business endpoint or issuance.
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class DatabaseModule {}
