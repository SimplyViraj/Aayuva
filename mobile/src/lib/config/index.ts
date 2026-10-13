import { loadMobileEnvironment, MobileEnvironment } from './environment';

// Only named public settings are read, so Expo can inline them without exposing
// the backend's environment or requiring Node runtime APIs on the device.
declare const process: { env: { EXPO_PUBLIC_APP_ENV?: string; EXPO_PUBLIC_API_BASE_URL?: string } };

export function getMobileEnvironment(): MobileEnvironment {
  return loadMobileEnvironment({
    appEnvironment: process.env.EXPO_PUBLIC_APP_ENV,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  }, __DEV__);
}
