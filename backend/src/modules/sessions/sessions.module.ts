import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SessionStore } from './session-store.service';

@Module({ imports: [DatabaseModule], providers: [SessionStore], exports: [SessionStore] })
export class SessionsModule {}
