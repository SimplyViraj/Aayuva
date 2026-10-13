import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

export interface AccessClaims { userId: string; sessionId: string }
export interface VerificationSettings {
  issuer: string;
  audience: string;
  publicKeys: Readonly<Record<string, string>>;
  clockToleranceSeconds: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACCESS_LIFETIME_SECONDS = 15 * 60; // Owner-approved DEC-008 value.

export class JwtAccessVerifier {
  constructor(
    private readonly jwt: JwtService,
    private readonly settings: VerificationSettings,
    private readonly now: () => number,
  ) {
    if (!settings.issuer || !settings.audience || !Object.keys(settings.publicKeys).length ||
        !Number.isSafeInteger(settings.clockToleranceSeconds) || settings.clockToleranceSeconds < 0) {
      throw new Error('Incomplete token verification configuration.');
    }
  }

  async verify(token: string): Promise<AccessClaims> {
    try {
      // Decoding only selects an already-trusted key; it establishes no identity.
      const decoded: unknown = this.jwt.decode(token, { complete: true });
      if (typeof decoded !== 'object' || decoded === null || !('header' in decoded)) throw new Error();
      const header = decoded.header;
      if (typeof header !== 'object' || header === null || !('kid' in header) || !('alg' in header) || header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error();
      if (!Object.hasOwn(this.settings.publicKeys, header.kid)) throw new Error();
      const publicKey = this.settings.publicKeys[header.kid];
      if (!publicKey) throw new Error();
      const now = Math.floor(this.now() / 1000);
      const payload = await this.jwt.verifyAsync<Record<string, unknown>>(token, {
        publicKey, algorithms: ['RS256'], issuer: this.settings.issuer, audience: this.settings.audience,
        clockTimestamp: now, clockTolerance: this.settings.clockToleranceSeconds,
      });
      if (typeof payload.sub !== 'string' || !UUID.test(payload.sub) || typeof payload.sid !== 'string' || !UUID.test(payload.sid) || payload.purpose !== 'access') throw new Error();
      const issued = payload.iat; const expires = payload.exp;
      if (typeof issued !== 'number' || typeof expires !== 'number' || !Number.isSafeInteger(issued) || !Number.isSafeInteger(expires) ||
          issued > now + this.settings.clockToleranceSeconds || expires <= issued || expires - issued > ACCESS_LIFETIME_SECONDS) throw new Error();
      // Roles and other provider/client claims are never authority.
      return { userId: payload.sub.toLowerCase(), sessionId: payload.sid.toLowerCase() };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
