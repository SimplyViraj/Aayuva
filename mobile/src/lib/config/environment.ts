export interface MobileEnvironment {
  apiBaseUrl: string;
  environment: 'development' | 'test' | 'staging' | 'production';
}

export function loadMobileEnvironment(
  raw: { appEnvironment?: string; apiBaseUrl?: string },
  developmentBuild: boolean,
): MobileEnvironment {
  const environment = raw.appEnvironment;
  if (!environment || !['development', 'test', 'staging', 'production'].includes(environment)) {
    throw new Error('Invalid application environment.');
  }
  let url: URL;
  try { url = new URL(raw.apiBaseUrl ?? ''); }
  catch { throw new Error('Invalid API configuration.'); }

  const localHttp = developmentBuild && (environment === 'development' || environment === 'test') && url.protocol === 'http:';
  if ((!localHttp && url.protocol !== 'https:') || url.username || url.password || url.search || url.hash) {
    throw new Error('Invalid API configuration.');
  }
  return {
    environment: environment as MobileEnvironment['environment'],
    apiBaseUrl: url.toString().replace(/\/$/, ''),
  };
}
