import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtAccessVerifier } from './jwt-access-verifier';
import { SessionReader } from '../sessions/session-store.service';

export interface Principal { readonly userId: string; readonly sessionId: string }
export interface RequestAuthenticator { authenticate(token: string): Promise<Principal> }

export class SessionAuthenticator implements RequestAuthenticator {
  constructor(private readonly verifier: JwtAccessVerifier, private readonly sessions: SessionReader, private readonly now: () => number) {}

  async authenticate(token: string): Promise<Principal> {
    const claims = await this.verifier.verify(token);
    let session;
    try { session = await this.sessions.find(claims.sessionId); }
    catch { throw new ServiceUnavailableException(); }
    if (!session || session.id !== claims.sessionId || session.userId !== claims.userId || session.accountStatus !== 'ACTIVE' || session.revokedAt || !Number.isFinite(session.expiresAt.getTime()) || session.expiresAt.getTime() <= this.now()) {
      throw new UnauthorizedException();
    }
    return Object.freeze({ userId: session.userId, sessionId: session.id });
  }
}
