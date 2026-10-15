import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { SocialFlow, SocialMethod, SocialPlatform } from './social-api';

declare const process: { env: { EXPO_PUBLIC_GOOGLE_ENABLED?: string; EXPO_PUBLIC_APPLE_ENABLED?: string; EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string; EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?: string } };
export class SocialCancelled extends Error { constructor() { super('Sign-in cancelled.'); } }
export interface NativeIdentity { idToken: string; displayName?: string }
export interface SocialAvailability { platform: SocialPlatform; google: boolean; apple: boolean }
export function socialAvailability(): SocialAvailability {
  const native = Constants.executionEnvironment !== 'storeClient';
  return {
    platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    google: native && ['ios', 'android'].includes(Platform.OS) && process.env.EXPO_PUBLIC_GOOGLE_ENABLED === 'true' && !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID && (Platform.OS !== 'ios' || !!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
    apple: native && Platform.OS === 'ios' && process.env.EXPO_PUBLIC_APPLE_ENABLED === 'true',
  };
}
export async function nativeSocialIdentity(method: SocialMethod, flow: SocialFlow): Promise<NativeIdentity> {
  const available = socialAvailability();
  if (!(method === 'GOOGLE' ? available.google : available.apple)) throw new Error('Sign-in is unavailable.');
  try {
    if (method === 'GOOGLE') {
      // Import only after the native-build/configuration gate. Expo Go must
      // never load Nitro's native module while rendering registration screens.
      // Metro/Jest-compatible lazy loading keeps native code behind the gate.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sdk: typeof import('react-native-nitro-google-signin') = require('react-native-nitro-google-signin');
      sdk.GoogleOneTapSignIn.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, nonce: flow.nonce, offlineAccess: false, autoSelectOnSignIn: false });
      if (Platform.OS === 'android') await sdk.GoogleOneTapSignIn.checkPlayServices();
      const response = await sdk.GoogleOneTapSignIn.presentExplicitSignIn();
      if (sdk.isCancelledResponse(response)) throw new SocialCancelled();
      if (!sdk.isSuccessResponse(response) || !response.data.idToken) throw new Error();
      return { idToken: response.data.idToken };
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sdk: typeof import('expo-apple-authentication') = require('expo-apple-authentication');
    if (!await sdk.isAvailableAsync()) throw new Error();
    const response = await sdk.signInAsync({ nonce: flow.nonce, state: flow.token, requestedScopes: [sdk.AppleAuthenticationScope.FULL_NAME, sdk.AppleAuthenticationScope.EMAIL] });
    if (!response.identityToken || response.state !== flow.token) throw new Error();
    const name = [response.fullName?.givenName, response.fullName?.familyName].filter(Boolean).join(' ').trim();
    return { idToken: response.identityToken, ...(name && Array.from(name).length <= 100 ? { displayName: name } : {}) };
  } catch (error) {
    if (error instanceof SocialCancelled || (typeof error === 'object' && error !== null && 'code' in error && ['ERR_REQUEST_CANCELED', 'SIGN_IN_CANCELLED'].includes(String(error.code)))) throw new SocialCancelled();
    throw new Error('Provider sign-in could not be completed.');
  }
}
