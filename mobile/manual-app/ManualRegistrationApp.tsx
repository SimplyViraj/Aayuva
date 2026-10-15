import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { RegistrationProvider, useRegistration } from '../src/providers/RegistrationProvider';
import { registrationApi } from '../src/features/auth/services/registration-api';
import { pendingCredential, PendingStorage } from '../src/features/auth/services/pending-store';
import { RegistrationScreen, PhoneVerificationScreen, EmailVerificationScreen } from '../src/features/auth/components/RegistrationScreens';
import { RegistrationButton, RegistrationField, RegistrationFrame } from '../src/features/auth/components/RegistrationFrame';
import { StateNotice } from '../src/components/feedback/StateNotice';
import { ApiClient, ApiError } from '../src/lib/api/client';
import { loadMobileEnvironment } from '../src/lib/config/environment';
import { CredentialStore } from '../src/lib/storage/credential-store';

// Independent test entry, never imported by the production Router entry.
const nativeStorage = new CredentialStore({
  get: () => SecureStore.getItemAsync('aayuva.manual-registration'),
  set: (value) => SecureStore.setItemAsync('aayuva.manual-registration', value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  remove: () => SecureStore.deleteItemAsync('aayuva.manual-registration'),
});
const storage: PendingStorage = {
  read: async () => { const value = await nativeStorage.read(); return value ? pendingCredential(JSON.parse(value) as unknown) : null; },
  write: async (value) => { await nativeStorage.write(JSON.stringify(pendingCredential(value))); },
  clear: () => nativeStorage.clear(),
};
export function proofFromLink(value: string): string {
  const link = new URL(value); const proof = link.searchParams.get('authorization');
  if (!['https:', 'aayuva:'].includes(link.protocol) || link.username || link.password || link.hash || [...link.searchParams.keys()].length !== 1 || !proof || !/^[A-Za-z0-9_-]{43}$/.test(proof)) throw new Error('Invalid verification link.');
  return proof;
}
export default function ManualRegistrationApp() {
  const [url, setUrl] = useState(''); const [key, setKey] = useState('');
  const [connection, setConnection] = useState<{ url: string; key: string }>(); const [error, setError] = useState(false);
  const client = useMemo(() => connection ? new ApiClient(connection.url, 25_000, (target, options) => fetch(target, { ...options, headers: { ...options.headers, 'X-Manual-Test-Key': connection.key } })) : null, [connection]);
  const createApi = useMemo(() => client ? (token: string) => registrationApi(client, token) : null, [client]);
  return <SafeAreaProvider>{!__DEV__ ? <RegistrationFrame title="Manual test"><StateNotice kind="denied" message="Manual testing requires a development session." /></RegistrationFrame>
    : !client || !createApi ? <RegistrationFrame title="Connect registration test">
      <StateNotice kind="empty" message="Use the local test API and private pairing key shown in your backend terminal." />
      <RegistrationField label="Test API URL" value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
      <RegistrationField label="Private pairing key" value={key} onChangeText={setKey} autoCapitalize="none" autoCorrect={false} secureTextEntry />
      <RegistrationButton label="Connect test app" disabled={!url || !/^[A-Za-z0-9_-]{43}$/.test(key)} onPress={() => {
        try { const configured = loadMobileEnvironment({ appEnvironment: 'test', apiBaseUrl: url.trim() }, __DEV__); setConnection({ url: configured.apiBaseUrl, key }); setKey(''); setError(false); }
        catch { setError(true); }
      }} />{error && <StateNotice kind="error" message="Check the test API URL." />}
    </RegistrationFrame> : <RegistrationProvider storage={storage} createApi={createApi}><TestSession client={client} disconnect={() => setConnection(undefined)} /></RegistrationProvider>}</SafeAreaProvider>;
}
function TestSession({ client, disconnect }: { client: ApiClient; disconnect(): void }) {
  const session = useRegistration(); const [page, setPage] = useState<'profile' | 'phone' | 'email' | 'link'>('profile');
  const [link, setLink] = useState(''); const [proof, setProof] = useState<string>(); const [busy, setBusy] = useState(false); const [error, setError] = useState<string>();
  if (session.phase === 'loading') return <RegistrationFrame title="Registration test"><StateNotice kind="loading" message="Checking account setup…" /></RegistrationFrame>;
  if (session.phase === 'none' || session.phase === 'unavailable') return <RegistrationFrame title="Registration test">
    <StateNotice kind={session.phase === 'none' ? 'empty' : 'error'} message={session.phase === 'none' ? 'Start an isolated registration. Phone and email verification use your configured test destinations.' : 'Check your test server, pairing key and device connection.'} />
    <RegistrationButton label="Start test registration" disabled={busy} onPress={() => { if (busy) return; setBusy(true); setError(undefined); void client.request('/registration', pendingCredential, { method: 'POST', body: {} }).then((issued) => session.begin(issued)).catch((failure: unknown) => setError(
      failure instanceof ApiError && failure.code === 'unavailable' && failure.status === undefined
        ? 'Cannot reach the test API. Check its URL, your network connection and Expo Go local-network permission.'
        : failure instanceof ApiError ? failure.message : 'Test registration could not start.'
    )).finally(() => setBusy(false)); }} />
    <RegistrationButton label="Retry saved setup" disabled={busy} onPress={() => { void session.refresh(); }} />
    <RegistrationButton label="Clear local test setup" disabled={busy} onPress={() => { void session.clear().catch(() => setError('Local setup could not be cleared.')); }} />
    <RegistrationButton label="Change test connection" disabled={busy} onPress={disconnect} />
    {error && <StateNotice kind="error" message={error} />}
  </RegistrationFrame>;
  if (page === 'phone') return <PhoneVerificationScreen back={() => setPage('profile')} />;
  if (page === 'link') return <RegistrationFrame title="Open verification email">
    <RegistrationField label="Received email verification link" value={link} onChangeText={setLink} autoCapitalize="none" autoCorrect={false} secureTextEntry />
    <RegistrationButton label="Use received link" disabled={!link} onPress={() => { try { setProof(proofFromLink(link.trim())); setLink(''); setError(undefined); setPage('email'); } catch { setLink(''); setError('Use the latest registration verification link.'); } }} />
    <RegistrationButton label="Back to email verification" onPress={() => { setLink(''); setError(undefined); setPage('email'); }} />
    {error && <StateNotice kind="error" message={error} />}
  </RegistrationFrame>;
  if (page === 'email') return <View style={{ flex: 1 }}><EmailVerificationScreen authorization={proof} onAuthorizationUsed={() => setProof(undefined)} back={() => { setProof(undefined); setPage('profile'); }} /><RegistrationButton label="Paste received email link" onPress={() => { setProof(undefined); setPage('link'); }} /></View>;
  return <RegistrationScreen go={(destination) => { setProof(undefined); setLink(''); setPage(destination === 'start' ? 'profile' : destination); }} />;
}
