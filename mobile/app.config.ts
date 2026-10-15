import type { ConfigContext, ExpoConfig } from 'expo/config';

declare const process: { env: Record<string, string | undefined> };
export default function configure({ config }: ConfigContext): ExpoConfig {
  const google = process.env.EXPO_PUBLIC_GOOGLE_ENABLED === 'true'; const apple = process.env.EXPO_PUBLIC_APPLE_ENABLED === 'true';
  const plugins = [...(config.plugins ?? [])];
  if (google || apple) plugins.push('expo-dev-client');
  if (google) {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || !process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || !process.env.GOOGLE_IOS_URL_SCHEME || !process.env.EXPO_PUBLIC_IOS_BUNDLE_ID || !process.env.EXPO_PUBLIC_ANDROID_PACKAGE) throw new Error('Google native build configuration is incomplete.');
    plugins.push(['react-native-nitro-google-signin', { iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME }]);
  }
  if (apple) {
    if (!process.env.EXPO_PUBLIC_IOS_BUNDLE_ID) throw new Error('Apple native build configuration is incomplete.');
    plugins.push('expo-apple-authentication');
  }
  return { ...config, name: config.name ?? 'AAyuva', slug: config.slug ?? 'aayuva', plugins,
    ios: { ...config.ios, ...(process.env.EXPO_PUBLIC_IOS_BUNDLE_ID ? { bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_ID } : {}), ...(apple ? { usesAppleSignIn: true } : {}) },
    android: { ...config.android, ...(process.env.EXPO_PUBLIC_ANDROID_PACKAGE ? { package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE } : {}) },
  };
}
