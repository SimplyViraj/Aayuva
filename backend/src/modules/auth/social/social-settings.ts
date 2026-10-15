import { createPrivateKey, createPublicKey } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ConfigurationError } from '../../../config/environment';

export interface SocialSettings {
  google?: { audience: string; iosClientId: string; androidClientId: string };
  apple?: { audience: string };
  issuer: string; audience: string; keyId: string; privateKey: string; publicKey: string;
}

export function socialSettings(config: ConfigService): SocialSettings {
  const required = (name: string): string => {
    const value: unknown = config.get(name);
    if (typeof value !== 'string' || !value.trim()) throw new ConfigurationError([name]);
    return value;
  };
  let privateKey: string; let publicKey: string;
  try {
    const encoded = required('JWT_PRIVATE_KEY_BASE64');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error();
    const key = createPrivateKey(Buffer.from(encoded, 'base64'));
    if (key.asymmetricKeyType !== 'rsa' || (key.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) throw new Error();
    privateKey = key.export({ type: 'pkcs8', format: 'pem' }).toString();
    publicKey = createPublicKey(key).export({ type: 'spki', format: 'pem' }).toString();
  } catch { throw new ConfigurationError(['JWT_PRIVATE_KEY_BASE64']); }
  const keyId = required('JWT_KEY_ID');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(keyId)) throw new ConfigurationError(['JWT_KEY_ID']);
  return {
    issuer: required('JWT_ISSUER'), audience: required('JWT_AUDIENCE'), keyId, privateKey, publicKey,
    ...(config.get('AUTH_GOOGLE_ENABLED') === true ? { google: {
      audience: required('GOOGLE_WEB_CLIENT_ID'), iosClientId: required('GOOGLE_IOS_CLIENT_ID'), androidClientId: required('GOOGLE_ANDROID_CLIENT_ID'),
    } } : {}),
    ...(config.get('AUTH_APPLE_ENABLED') === true ? { apple: { audience: required('APPLE_IOS_AUDIENCE') } } : {}),
  };
}
