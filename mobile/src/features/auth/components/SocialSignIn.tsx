import { useEffect, useRef, useState, type ComponentType } from 'react';
import { View } from 'react-native';
import { ApiClient, ApiError } from '../../../lib/api/client';
import { getMobileEnvironment } from '../../../lib/config';
import { useOptionalRegistration } from '../../../providers/RegistrationProvider';
import { StateNotice } from '../../../components/feedback/StateNotice';
import { socialApi, type SocialApi, type SocialFlow, type SocialMethod } from '../services/social-api';
import { nativeSocialIdentity, socialAvailability, SocialCancelled, type NativeIdentity, type SocialAvailability } from '../services/native-social';
import { RegistrationButton } from './RegistrationFrame';

declare const process: { env: { EXPO_PUBLIC_API_TIMEOUT_MS?: string } };
function configuredApi(): SocialApi {
  const environment = getMobileEnvironment();
  // Real provider evidence must use the configured HTTPS application boundary.
  if (!environment.apiBaseUrl.startsWith('https://')) throw new Error();
  return socialApi(new ApiClient(environment.apiBaseUrl, Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS)));
}
function AppleButton({ onPress, disabled }: { onPress(): void; disabled: boolean }) {
  const [Button, setButton] = useState<ComponentType<{ onPress(): void; buttonType: number; buttonStyle: number; style: { width: number; height: number } }>>();
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sdk: typeof import('expo-apple-authentication') = require('expo-apple-authentication');
      if (active) setButton(() => sdk.AppleAuthenticationButton);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return Button ? <View pointerEvents={disabled ? 'none' : 'auto'} accessibilityState={{ disabled }}><Button buttonType={1} buttonStyle={2} style={{ width: 240, height: 48 }} onPress={onPress} /></View> : null;
}
export function SocialSignIn({ api: suppliedApi, authenticate = nativeSocialIdentity, availability = socialAvailability() }: {
  api?: SocialApi; authenticate?(method: SocialMethod, flow: SocialFlow): Promise<NativeIdentity>; availability?: SocialAvailability;
}) {
  const registration = useOptionalRegistration(); const [notice, setNotice] = useState<{ kind: 'error' | 'success'; message: string }>();
  const [session, setSession] = useState<{ token: string; expiresAt: string; displayName: string }>();
  const [busy, setBusy] = useState(false); const running = useRef(false); const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (!session) return;
    const timeout = setTimeout(() => { setSession(undefined); setNotice({ kind: 'error', message: 'Your session expired. Sign in again.' }); }, Math.min(900_000, Math.max(0, Date.parse(session.expiresAt) - Date.now())));
    return () => clearTimeout(timeout);
  }, [session]);
  async function perform(action: (api: SocialApi) => Promise<void>) {
    if (running.current) return;
    running.current = true; setBusy(true); setNotice(undefined);
    try { await action(suppliedApi ?? configuredApi()); }
    catch (error) {
      if (alive.current) setNotice({ kind: 'error', message: error instanceof SocialCancelled ? error.message : error instanceof ApiError ? error.message : 'Sign-in is temporarily unavailable.' });
    } finally { running.current = false; if (alive.current) setBusy(false); }
  }
  async function signIn(method: SocialMethod) {
    await perform(async (api) => {
      const flow = await api.start(method, availability.platform);
      if (!alive.current) return;
      const identity = await authenticate(method, flow);
      if (!alive.current) return;
      const result = await api.complete(flow.token, identity.idToken, identity.displayName);
      if (!alive.current) return;
      if (result.kind === 'onboarding') {
        if (!registration) throw new Error();
        await registration.begin(result);
      } else {
        const context = await api.context(result.accessToken);
        if (alive.current) setSession({ token: result.accessToken, expiresAt: result.expiresAt, displayName: context.displayName });
      }
    });
  }
  if (session) return <>
    <StateNotice kind="success" message={`Signed in as ${session.displayName}.`} />
    <RegistrationButton label="Check sign-in status" disabled={busy} onPress={() => { void perform(async (api) => {
      try { const context = await api.context(session.token); if (alive.current) setSession({ ...session, displayName: context.displayName }); }
      catch (error) { if (alive.current) setSession(undefined); throw error; }
    }); }} />
    <RegistrationButton label="Sign out" disabled={busy} onPress={() => { void perform(async (api) => {
      try { await api.logout(session.token); }
      catch (error) { if (!(error instanceof ApiError && error.code === 'unauthenticated')) throw error; }
      if (alive.current) { setSession(undefined); setNotice({ kind: 'success', message: 'Signed out.' }); }
    }); }} />
    {busy && <StateNotice kind="loading" message="Please wait…" />}{notice && <StateNotice {...notice} />}
  </>;
  return <>
    <RegistrationButton label="Continue with Google" disabled={busy || !availability.google} onPress={() => { void signIn('GOOGLE'); }} />
    {availability.platform === 'IOS' && (availability.apple && authenticate === nativeSocialIdentity
      ? <AppleButton disabled={busy} onPress={() => { void signIn('APPLE'); }} />
      : <RegistrationButton label="Continue with Apple" disabled={busy || !availability.apple} onPress={() => { void signIn('APPLE'); }} />)}
    {!availability.google && !availability.apple && <StateNotice kind="empty" message="Social sign-in is not configured for this build." />}
    {busy && <StateNotice kind="loading" message="Please wait…" />}{notice && <StateNotice {...notice} />}
  </>;
}
