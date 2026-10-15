import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, customFetch, jwtVerify, type JWTVerifyGetKey } from 'jose';
import type { SocialPlatform, SocialProvider } from '../../../generated/prisma/client';
import type { TrustedPrimaryIdentity } from '../registration/account-registration.service';
import { canonicalEmail, canonicalSubject } from '../../identity/normalization';
import { socialNonceHash } from '../registration/capabilities';
import { providerObject } from '../providers/provider-response';
import type { SocialSettings } from './social-settings';

export function providerKeys(provider: SocialProvider): JWTVerifyGetKey {
  const endpoint = provider === 'GOOGLE' ? 'https://www.googleapis.com/oauth2/v3/certs' : 'https://appleid.apple.com/auth/keys';
  return createRemoteJWKSet(new URL(endpoint), {
    cacheMaxAge: 300_000, cooldownDuration: 30_000, timeoutDuration: 10_000,
    [customFetch]: async (input, init): Promise<Response> => {
      try {
        const response = await fetch(input, { ...init, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10_000) });
        if (!response.ok) throw new Error();
        return new Response(JSON.stringify(await providerObject(response)), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch { throw new ServiceUnavailableException(); }
    },
  });
}

export class SocialProviderVerifier {
  private readonly googleKeys: JWTVerifyGetKey;
  private readonly appleKeys: JWTVerifyGetKey;
  constructor(private readonly settings: SocialSettings, keys?: { google: JWTVerifyGetKey; apple: JWTVerifyGetKey }, private readonly now: () => Date = () => new Date()) {
    this.googleKeys = keys?.google ?? providerKeys('GOOGLE'); this.appleKeys = keys?.apple ?? providerKeys('APPLE');
  }
  async verify(provider: SocialProvider, platform: SocialPlatform, token: string, nonceHash: string): Promise<TrustedPrimaryIdentity> {
    const configuration = provider === 'GOOGLE' ? this.settings.google : platform === 'IOS' ? this.settings.apple : undefined;
    if (!configuration) throw new ServiceUnavailableException();
    try {
      if (token.length > 16_384) throw new Error();
      const { payload, protectedHeader } = await jwtVerify(token, provider === 'GOOGLE' ? this.googleKeys : this.appleKeys, {
        algorithms: ['RS256'], issuer: provider === 'GOOGLE' ? ['https://accounts.google.com', 'accounts.google.com'] : 'https://appleid.apple.com',
        audience: configuration.audience, requiredClaims: ['sub', 'iss', 'aud', 'iat', 'exp', 'nonce'], clockTolerance: 30, currentDate: this.now(),
      });
      if (typeof protectedHeader.kid !== 'string' || !protectedHeader.kid || typeof payload.sub !== 'string' ||
          !Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp) || payload.iat! > Math.floor(this.now().getTime() / 1000) + 30 || payload.exp! <= payload.iat! ||
          typeof payload.nonce !== 'string' || socialNonceHash(payload.nonce) !== nonceHash) throw new Error();
      if (provider === 'GOOGLE') {
        const client = platform === 'IOS' ? this.settings.google!.iosClientId : this.settings.google!.androidClientId;
        if ((payload.azp !== undefined && payload.azp !== client && payload.azp !== configuration.audience) || (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp === undefined)) throw new Error();
      }
      const identity: TrustedPrimaryIdentity = { method: provider, subject: canonicalSubject(provider, payload.sub) };
      // Profile fields never replace the verified stable provider subject.
      if (typeof payload.name === 'string' && payload.name.trim() && Array.from(payload.name.trim()).length <= 100 && !payload.name.includes('\0')) identity.displayName = payload.name.trim();
      if (typeof payload.email === 'string' && (payload.email_verified === true || payload.email_verified === 'true')) {
        const email = canonicalEmail(payload.email);
        // Google notes that historical verification of third-party email alone
        // does not establish current mailbox ownership. Never mark it verified.
        if (provider === 'APPLE' || email.endsWith('@gmail.com') || (typeof payload.hd === 'string' && payload.hd.length > 0)) identity.verifiedEmail = email;
      }
      return identity;
    } catch (error) {
      if (error instanceof ServiceUnavailableException || (typeof error === 'object' && error !== null && 'code' in error && ['ERR_JWKS_TIMEOUT', 'ERR_JWKS_INVALID', 'ERR_JWK_INVALID'].includes(String(error.code)))) throw new ServiceUnavailableException();
      throw new UnauthorizedException();
    }
  }
}
