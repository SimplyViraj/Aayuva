import { ConflictException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { lockRegistration, registrationTime } from '../../../database/registration-transaction';
import { JwtAccessVerifier } from '../jwt-access-verifier';
import { SessionAuthenticator, type Principal } from '../session-authenticator';
import { SessionStore } from '../../sessions/session-store.service';
import type { SocialSettings } from './social-settings';

export interface InitialSession { kind: 'session'; accessToken: string; expiresAt: string }
export class SocialSessions {
  readonly authenticator: SessionAuthenticator;
  private readonly jwt = new JwtService();
  constructor(private readonly db: PrismaService, private readonly settings: SocialSettings) {
    this.authenticator = new SessionAuthenticator(new JwtAccessVerifier(this.jwt, {
      issuer: settings.issuer, audience: settings.audience, publicKeys: { [settings.keyId]: settings.publicKey }, clockToleranceSeconds: 30,
    }, Date.now), new SessionStore(db), Date.now);
  }
  async issueWithin(tx: Prisma.TransactionClient, userId: string): Promise<InitialSession> {
    await lockRegistration(tx, 'session:' + userId);
    const now = await registrationTime(tx);
    const user = await tx.user.findUnique({ where: { id: userId }, select: { status: true, role: true } });
    // Privileged-method policy remains DEL-006. This selected slice can issue
    // member sessions only, even for an already-associated provider subject.
    if (user?.status !== 'ACTIVE' || user.role !== 'MEMBER') throw new UnauthorizedException();
    if (await tx.session.count({ where: { userId, revokedAt: null, expiresAt: { gt: now } } }) >= 5) throw new ConflictException();
    const issued = Math.floor(now.getTime() / 1000); const expires = issued + 900;
    // R3-approved access-only sessions expire with the access credential.
    // Thirty-day inactivity/persistent renewal remains the DEL-005 requirement.
    const session = await tx.session.create({ data: { userId, createdAt: now, expiresAt: new Date(expires * 1000) }, select: { id: true } });
    const accessToken = await this.jwt.signAsync({ sub: userId, sid: session.id, purpose: 'access', iat: issued, exp: expires }, {
      algorithm: 'RS256', privateKey: this.settings.privateKey, keyid: this.settings.keyId, issuer: this.settings.issuer, audience: this.settings.audience,
    });
    return { kind: 'session', accessToken, expiresAt: new Date(expires * 1000).toISOString() };
  }
  async context(principal: Principal): Promise<{ displayName: string }> {
    try {
      const result = await this.db.user.findUnique({ where: { id: principal.userId }, select: { status: true, role: true, displayName: true } });
      if (result?.status !== 'ACTIVE' || result.role !== 'MEMBER' || !result.displayName) throw new UnauthorizedException();
      return { displayName: result.displayName };
    } catch (error) { if (error instanceof UnauthorizedException) throw error; throw new ServiceUnavailableException(); }
  }
  async logout(principal: Principal): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.session.updateMany({ where: { id: principal.sessionId, userId: principal.userId, revokedAt: null }, data: { revokedAt: await registrationTime(tx) } });
    });
  }
}
