import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface StoredSession {
  id: string; userId: string; expiresAt: Date; revokedAt: Date | null;
  accountStatus: 'ACTIVE' | 'ONBOARDING';
}
export interface SessionReader { find(id: string): Promise<StoredSession | null> }

@Injectable()
export class SessionStore implements SessionReader {
  constructor(private readonly database: PrismaService) {}

  async find(id: string): Promise<StoredSession | null> {
    const row = await this.database.session.findUnique({ where: { id }, select: { id: true, userId: true, expiresAt: true, revokedAt: true, user: { select: { status: true } } } });
    return row ? { id: row.id, userId: row.userId, expiresAt: row.expiresAt, revokedAt: row.revokedAt, accountStatus: row.user.status } : null;
  }

  async revoke(userId: string, sessionId: string, at: Date): Promise<void> {
    // The caller supplies the backend-established identity. Repetition never
    // overwrites the first invalidation or revokes another user's session.
    await this.database.session.updateMany({ where: { id: sessionId, userId, revokedAt: null }, data: { revokedAt: at } });
  }
}
