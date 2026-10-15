import { ReactNode, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { StateNotice } from '../../../components/feedback/StateNotice';
import { RegistrationSession, useRegistration } from '../../../providers/RegistrationProvider';
import { RegistrationApi, RegistrationStatus } from '../services/registration-api';
import { useRegistrationOperation } from '../hooks/use-registration-operation';
import { RegistrationButton, RegistrationField, RegistrationFrame, registrationStyles } from './RegistrationFrame';

interface Active { api: RegistrationApi; status: RegistrationStatus; refresh(): Promise<void>; clear(): Promise<void> }
const identities = new WeakMap<RegistrationApi, number>(); let nextIdentity = 0;
function identityKey(api: RegistrationApi): number {
  let key = identities.get(api);
  if (key === undefined) { key = ++nextIdentity; identities.set(api, key); }
  return key;
}
function SessionFrame({ title, session, children }: { title: string; session: RegistrationSession; children(active: Active): ReactNode }) {
  return <RegistrationFrame title={title}>
    {session.phase === 'loading' ? <StateNotice kind="loading" message="Checking account setup…" />
      : session.phase === 'unavailable' ? <StateNotice kind="error" message="Account setup is temporarily unavailable." onRetry={() => { void session.refresh(); }} />
      : session.phase === 'none' || !session.api || !session.status ? <StateNotice kind="empty" message="Begin account setup after signing in." />
      : <View key={identityKey(session.api)}>{children({ api: session.api, status: session.status, refresh: session.refresh, clear: session.clear })}</View>}
  </RegistrationFrame>;
}
function Feedback({ value }: { value: ReturnType<typeof useRegistrationOperation>['feedback'] }) {
  return value ? <StateNotice kind={value.kind} message={value.message} /> : null;
}
export function RegistrationScreen({ go }: { go(destination: 'phone' | 'email' | 'start'): void }) {
  const session = useRegistration();
  return <SessionFrame title="Complete your account" session={session}>{(active) => <Profile {...active} go={go} />}</SessionFrame>;
}
function Profile({ api, status, refresh, clear, go }: Active & { go(destination: 'phone' | 'email' | 'start'): void }) {
  const [name, setName] = useState(status.displayName ?? ''); const operation = useRegistrationOperation(api);
  useEffect(() => { setName(status.displayName ?? ''); }, [api, status.displayName]);
  if (status.stage === 'completed') return <>
    <StateNotice kind="success" message="Account setup is complete. You can sign in." />
    <RegistrationButton label="Back to start" disabled={operation.busy} onPress={() => { void operation.run(clear, 'Account setup cleared.').then((result) => { if (result.ok) go('start'); }); }} />
  </>;
  return <>
    <RegistrationField label="Full or display name" value={name} onChangeText={setName} autoCapitalize="words" editable={!operation.busy} />
    <RegistrationButton label="Save name" disabled={operation.busy || !name.trim() || Array.from(name.trim()).length > 100} onPress={() => { void operation.run(() => api.profile(name.trim()), 'Name saved.').then((result) => { if (result.ok) void refresh(); }); }} />
    <Text style={registrationStyles.text}>Phone: {status.phoneVerified ? 'verified' : 'verification required'}</Text>
    {!status.phoneVerified && <RegistrationButton label="Verify phone" disabled={operation.busy} onPress={() => go('phone')} />}
    {status.emailRequired && <Text style={registrationStyles.text}>Email: {status.emailVerified ? 'verified' : 'verification required'}</Text>}
    {status.emailRequired && !status.emailVerified && <RegistrationButton label="Verify email" disabled={operation.busy} onPress={() => go('email')} />}
    <RegistrationButton label="Complete account setup" disabled={operation.busy || !status.displayName || !status.phoneVerified || (status.emailRequired && !status.emailVerified)} onPress={() => { void operation.run(() => api.complete(), 'Account setup completed.').then((result) => { if (result.ok) void refresh(); }); }} />
    <RegistrationButton label="Refresh status" disabled={operation.busy} onPress={() => { void operation.run(refresh, 'Status refreshed.'); }} />
    <RegistrationButton label="Cancel account setup" disabled={operation.busy} onPress={() => { void operation.run(async () => { await api.cancel(); await clear(); }, 'Account setup cancelled.').then((result) => { if (result.ok) go('start'); }); }} />
    <Feedback value={operation.feedback} />
  </>;
}
function useResendTime(backendUntil: string | null) {
  const [until, setUntil] = useState<string | null>(backendUntil); const [now, setNow] = useState(Date.now()); const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { setUntil(backendUntil); }, [backendUntil]);
  useEffect(() => { if (!until) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [until]);
  return { seconds: until ? Math.max(0, Math.ceil((Date.parse(until) - now) / 1000)) : 0, setUntil: (value: string | null) => {
    if (alive.current) { setUntil(value); setNow(Date.now()); }
  } };
}
export function PhoneVerificationScreen({ back }: { back(): void }) {
  const session = useRegistration();
  return <SessionFrame title="Verify your phone" session={session}>{(active) => <Phone {...active} back={back} />}</SessionFrame>;
}
function Phone({ api, status, refresh, back }: Active & { back(): void }) {
  const [phone, setPhone] = useState(status.phone ?? ''); const [code, setCode] = useState(''); const operation = useRegistrationOperation(api); const resend = useResendTime(status.phoneResendAt);
  useEffect(() => { setPhone(status.phone ?? ''); setCode(''); }, [api, status.phone]);
  if (status.stage === 'completed' || status.phoneVerified) return <><StateNotice kind="success" message="Your phone is verified." /><RegistrationButton label="Back to account setup" onPress={back} /></>;
  return <>
    <RegistrationField label="India phone number (+91)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" editable={!operation.busy} />
    <Text style={registrationStyles.text}>By requesting a code, you consent to an SMS for phone verification.</Text>
    <RegistrationButton label={resend.seconds ? `Request available in ${resend.seconds}s` : 'Send verification SMS'} disabled={operation.busy || !phone.trim() || resend.seconds > 0} onPress={() => { void operation.run(() => api.phone(phone), 'Verification SMS requested.').then((result) => { if (result.ok) resend.setUntil(result.value.resendAt); }); }} />
    <RegistrationField label="SMS verification code" value={code} onChangeText={setCode} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" maxLength={10} editable={!operation.busy} />
    <RegistrationButton label="Check phone code" disabled={operation.busy || !/^[0-9]{4,10}$/.test(code)} onPress={() => { const transient = code; setCode(''); void operation.run(() => api.checkPhone(transient), 'Phone verified.').then((result) => { if (result.ok) void refresh(); }); }} />
    <RegistrationButton label="Start fresh phone verification" disabled={operation.busy} onPress={() => { setCode(''); void operation.run(() => api.restartPhone(), 'Previous verification cancelled. Request a fresh SMS when available.'); }} />
    <RegistrationButton label="Refresh status" disabled={operation.busy} onPress={() => { void operation.run(refresh, 'Status refreshed.'); }} />
    <RegistrationButton label="Back to account setup" disabled={operation.busy} onPress={back} /><Feedback value={operation.feedback} />
  </>;
}
export function EmailVerificationScreen({ authorization, onAuthorizationUsed, back }: { authorization?: string; onAuthorizationUsed?(): void; back(): void }) {
  const session = useRegistration();
  return <SessionFrame title="Verify your email" session={session}>{(active) => <Email {...active} authorization={authorization} onAuthorizationUsed={onAuthorizationUsed} back={back} />}</SessionFrame>;
}
function Email({ api, status, refresh, back, authorization, onAuthorizationUsed }: Active & { authorization?: string; onAuthorizationUsed?(): void; back(): void }) {
  const [proof, setProof] = useState(authorization ?? ''); const operation = useRegistrationOperation(api); const resend = useResendTime(status.emailResendAt);
  useEffect(() => { setProof(authorization ?? ''); }, [api, authorization]);
  async function requestEmail() {
    const email = status.email;
    if (!email) return;
    setProof(''); onAuthorizationUsed?.();
    const result = await operation.run(async () => {
      try { return await api.email(email); }
      catch (error) {
        // Delivery may fail after the server commits its resend wait. Read
        // status once without replaying delivery or replacing the send error.
        try { resend.setUntil((await api.status()).emailResendAt); } catch { /* Preserve the original delivery error. */ }
        throw error;
      }
    }, 'Verification email requested.');
    if (result.ok) resend.setUntil(result.value.resendAt);
  }
  if (status.stage === 'completed' || status.emailVerified || !status.emailRequired) return <><StateNotice kind="success" message="Email verification is complete." /><RegistrationButton label="Back to account setup" onPress={back} /></>;
  return <>
    <Text style={registrationStyles.text}>Verify {status.email ?? 'the email used to sign in'}. Only the latest verification link works, and it expires after five minutes.</Text>
    <RegistrationButton label={resend.seconds ? `Resend available in ${resend.seconds}s` : 'Send verification email'} disabled={operation.busy || !status.email || resend.seconds > 0} onPress={() => { void requestEmail(); }} />
    <Text style={registrationStyles.text}>{proof ? 'Your verification link is ready.' : 'Open the latest verification link from your email to continue.'}</Text>
    <RegistrationButton label="Verify email" disabled={operation.busy || !/^[A-Za-z0-9_-]{43}$/.test(proof)} onPress={() => { const transient = proof; setProof(''); onAuthorizationUsed?.(); void operation.run(() => api.checkEmail(transient), 'Email verified.').then((result) => { if (result.ok) void refresh(); }); }} />
    <RegistrationButton label="Refresh status" disabled={operation.busy} onPress={() => { void operation.run(refresh, 'Status refreshed.'); }} />
    <RegistrationButton label="Back to account setup" disabled={operation.busy} onPress={back} /><Feedback value={operation.feedback} />
  </>;
}
