export type RuntimeEnvironment = 'development' | 'test' | 'staging' | 'production';

export interface BackendEnvironment {
  NODE_ENV: RuntimeEnvironment;
  PORT: number;
  API_DOCS_ENABLED: boolean;
  AUTH_PASSWORD_ENABLED: false;
  AUTH_PHONE_ENABLED: false;
  AUTH_GOOGLE_ENABLED: boolean;
  AUTH_APPLE_ENABLED: boolean;
  GOOGLE_WEB_CLIENT_ID?: string;
  GOOGLE_IOS_CLIENT_ID?: string;
  GOOGLE_ANDROID_CLIENT_ID?: string;
  APPLE_IOS_AUDIENCE?: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
  JWT_KEY_ID?: string;
  JWT_PRIVATE_KEY_BASE64?: string;
  DATABASE_URL?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_VERIFY_SERVICE_SID?: string;
  RESEND_API_KEY?: string;
  REGISTRATION_EMAIL_SENDER?: string;
  REGISTRATION_EMAIL_URL?: string;
  REGISTRATION_ABUSE_KEY_ID?: string;
  REGISTRATION_ABUSE_KEY?: string;
}

const AUTH_FLAGS = [
  'AUTH_PASSWORD_ENABLED', 'AUTH_PHONE_ENABLED',
] as const;

export class ConfigurationError extends Error {
  constructor(readonly fields: readonly string[]) {
    // Values can be secrets. Report only the fixed configuration field names.
    super(`Invalid configuration: ${fields.join(', ')}`);
    this.name = 'ConfigurationError';
  }
}

function booleanSetting(value: unknown): boolean | undefined {
  if (value === undefined || value === 'false') return false;
  if (value === 'true') return true;
  return undefined;
}

export function validateEnvironment(raw: Record<string, unknown>): BackendEnvironment {
  const errors: string[] = [];
  const environment = raw.NODE_ENV;
  if (!['development', 'test', 'staging', 'production'].includes(String(environment))) {
    errors.push('NODE_ENV');
  }
  const portText = raw.PORT ?? '3000';
  const port = typeof portText === 'string' && /^\d+$/.test(portText) ? Number(portText) : NaN;
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) errors.push('PORT');

  const docs = booleanSetting(raw.API_DOCS_ENABLED);
  if (docs === undefined || (docs && environment !== 'development' && environment !== 'test')) {
    errors.push('API_DOCS_ENABLED');
  }
  for (const flag of AUTH_FLAGS) {
    // No real authentication workflow exists yet. Later tasks replace this gate
    // only after their reviewed policies, provider configuration and tests exist.
    if (booleanSetting(raw[flag]) !== false) errors.push(flag);
  }
  const databaseUrl = raw.DATABASE_URL;
  if (databaseUrl !== undefined) {
    try {
      if (typeof databaseUrl !== 'string') throw new Error();
      const parsed = new URL(databaseUrl);
      if (!['postgresql:', 'postgres:'].includes(parsed.protocol) || !parsed.hostname || parsed.hash) errors.push('DATABASE_URL');
    } catch { errors.push('DATABASE_URL'); }
  }
  const registration: Partial<BackendEnvironment> = {};
  for (const key of ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID', 'RESEND_API_KEY', 'REGISTRATION_EMAIL_SENDER', 'REGISTRATION_EMAIL_URL', 'REGISTRATION_ABUSE_KEY_ID', 'REGISTRATION_ABUSE_KEY'] as const) {
    const value = raw[key];
    if (value !== undefined) {
      if (typeof value !== 'string' || !value.trim() || value.length > 2048) errors.push(key);
      else registration[key] = value;
    }
  }
  const social: Partial<BackendEnvironment> = {};
  for (const key of ['GOOGLE_WEB_CLIENT_ID', 'GOOGLE_IOS_CLIENT_ID', 'GOOGLE_ANDROID_CLIENT_ID', 'APPLE_IOS_AUDIENCE', 'JWT_ISSUER', 'JWT_AUDIENCE', 'JWT_KEY_ID', 'JWT_PRIVATE_KEY_BASE64'] as const) {
    const value = raw[key];
    if (value !== undefined) {
      if (typeof value !== 'string' || !value.trim() || value.length > 16384) errors.push(key);
      else social[key] = value;
    }
  }
  const google = booleanSetting(raw.AUTH_GOOGLE_ENABLED); const apple = booleanSetting(raw.AUTH_APPLE_ENABLED);
  const common = ['DATABASE_URL', 'JWT_ISSUER', 'JWT_AUDIENCE', 'JWT_KEY_ID', 'JWT_PRIVATE_KEY_BASE64', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID', 'RESEND_API_KEY', 'REGISTRATION_EMAIL_SENDER', 'REGISTRATION_EMAIL_URL', 'REGISTRATION_ABUSE_KEY_ID', 'REGISTRATION_ABUSE_KEY'];
  for (const [flag, enabled, specific] of [
    ['AUTH_GOOGLE_ENABLED', google, ['GOOGLE_WEB_CLIENT_ID', 'GOOGLE_IOS_CLIENT_ID', 'GOOGLE_ANDROID_CLIENT_ID']],
    ['AUTH_APPLE_ENABLED', apple, ['APPLE_IOS_AUDIENCE']],
  ] as const) {
    if (enabled === undefined || (enabled && [...common, ...specific].some((key) => typeof raw[key] !== 'string' || !(raw[key] as string).trim()))) errors.push(flag);
  }
  if (errors.length) throw new ConfigurationError(errors);
  return {
    NODE_ENV: environment as RuntimeEnvironment,
    PORT: port,
    API_DOCS_ENABLED: docs as boolean,
    AUTH_PASSWORD_ENABLED: false,
    AUTH_PHONE_ENABLED: false,
    AUTH_GOOGLE_ENABLED: google ?? false,
    AUTH_APPLE_ENABLED: apple ?? false,
    ...registration, ...social,
    ...(typeof databaseUrl === 'string' ? { DATABASE_URL: databaseUrl } : {}),
  };
}
