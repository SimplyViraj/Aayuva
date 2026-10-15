import { nativeSocialIdentity, socialAvailability, SocialCancelled } from '../src/features/auth/services/native-social';
declare const process: { env: Record<string, string | undefined> };
jest.mock('expo-constants', () => ({ __esModule: true, default: { executionEnvironment: 'bare' } }));
jest.mock('react-native-nitro-google-signin', () => ({
  GoogleOneTapSignIn: { configure: jest.fn(), checkPlayServices: jest.fn(), presentExplicitSignIn: jest.fn() },
  isSuccessResponse: (value: { type: string }) => value.type === 'success', isCancelledResponse: (value: { type: string }) => value.type === 'cancelled',
}));
jest.mock('expo-apple-authentication', () => ({ isAvailableAsync: jest.fn().mockResolvedValue(true), signInAsync: jest.fn(), AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 } }));
const flow = { token: 'A'.repeat(43), nonce: 'a'.repeat(64), expiresAt: '2100-01-01T00:00:00.000Z' };
beforeEach(() => { process.env.EXPO_PUBLIC_GOOGLE_ENABLED = 'true'; process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'fixture-web'; process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = 'fixture-ios'; process.env.EXPO_PUBLIC_APPLE_ENABLED = 'true'; });
afterEach(() => { for (const name of ['EXPO_PUBLIC_GOOGLE_ENABLED', 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID', 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID', 'EXPO_PUBLIC_APPLE_ENABLED']) delete process.env[name]; });
it('passes the fresh nonce to explicit Google sign-in and returns only ID-token evidence', async () => {
  const sdk = jest.requireMock('react-native-nitro-google-signin');
  sdk.GoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValue({ type: 'success', data: { idToken: 'signed.id.token', accessToken: 'discard-canary' } });
  expect(await nativeSocialIdentity('GOOGLE', flow)).toEqual({ idToken: 'signed.id.token' });
  expect(sdk.GoogleOneTapSignIn.configure).toHaveBeenCalledWith(expect.objectContaining({ nonce: flow.nonce, offlineAccess: false }));
});
it('binds Apple nonce/state, accepts missing first-time profile, and rejects changed state', async () => {
  const sdk = jest.requireMock('expo-apple-authentication');
  sdk.signInAsync.mockResolvedValueOnce({ identityToken: 'signed.id.token', state: flow.token, fullName: null }).mockResolvedValueOnce({ identityToken: 'signed.id.token', state: 'foreign' });
  expect(await nativeSocialIdentity('APPLE', flow)).toEqual({ idToken: 'signed.id.token' });
  expect(sdk.signInAsync).toHaveBeenCalledWith(expect.objectContaining({ nonce: flow.nonce, state: flow.token }));
  await expect(nativeSocialIdentity('APPLE', flow)).rejects.toThrow('Provider sign-in could not be completed.');
});
it('maps cancellation and strips native exception details', async () => {
  const sdk = jest.requireMock('react-native-nitro-google-signin');
  sdk.GoogleOneTapSignIn.presentExplicitSignIn.mockResolvedValueOnce({ type: 'cancelled' }).mockRejectedValueOnce(new Error('private-native-canary'));
  await expect(nativeSocialIdentity('GOOGLE', flow)).rejects.toBeInstanceOf(SocialCancelled);
  await expect(nativeSocialIdentity('GOOGLE', flow)).rejects.toThrow('Provider sign-in could not be completed.');
});
it('keeps Google disabled before public configuration is supplied', () => {
  delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID; expect(socialAvailability().google).toBe(false);
});
