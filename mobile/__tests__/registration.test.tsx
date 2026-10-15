import { Text } from 'react-native';
import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { RegistrationProvider, useRegistration } from '../src/providers/RegistrationProvider';
import { RegistrationApi, RegistrationStatus } from '../src/features/auth/services/registration-api';
import { PendingCredential, PendingStorage } from '../src/features/auth/services/pending-store';
import { EmailVerificationScreen, PhoneVerificationScreen, RegistrationScreen } from '../src/features/auth/components/RegistrationScreens';
import { ApiError } from '../src/lib/api/client';

jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: jest.requireActual('react-native').View }));
const status: RegistrationStatus = { stage: 'onboarding', displayName: 'Member', phone: null, email: 'member@example.test', phoneVerified: false, emailVerified: false, emailRequired: true, expiresAt: '2100-01-01T00:00:00.000Z', phoneResendAt: null, emailResendAt: null };
const credential: PendingCredential = { token: 'A'.repeat(43), expiresAt: status.expiresAt };
function storage(): PendingStorage {
  let value: PendingCredential | null = credential;
  return { read: async () => value, write: async (next) => { value = next; }, clear: async () => { value = null; } };
}
function api(): RegistrationApi {
  return { status: jest.fn<Promise<RegistrationStatus>, []>().mockResolvedValue(status), profile: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined),
    phone: jest.fn<Promise<{ expiresAt: string; resendAt: string }>, [string]>().mockResolvedValue({ expiresAt: status.expiresAt, resendAt: new Date(Date.now() + 60_000).toISOString() }),
    checkPhone: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined), restartPhone: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
    email: jest.fn<Promise<{ expiresAt: string; resendAt: string }>, [string]>().mockResolvedValue({ expiresAt: status.expiresAt, resendAt: new Date(Date.now() + 30_000).toISOString() }),
    checkEmail: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined), complete: jest.fn<Promise<void>, []>().mockResolvedValue(undefined), cancel: jest.fn<Promise<void>, []>().mockResolvedValue(undefined) };
}
function Probe() {
  const session = useRegistration();
  return <><Text>{session.phase}</Text><Text onPress={() => { void session.clear(); }}>Clear context</Text></>;
}
it('requires backend confirmation on restore and ignores an obsolete success after clearing', async () => {
  const provider = api(); let finish: (value: RegistrationStatus) => void = () => undefined;
  provider.status = () => new Promise((resolve) => { finish = resolve; });
  await render(<RegistrationProvider storage={storage()} createApi={() => provider}><Probe /></RegistrationProvider>);
  expect(screen.getByText('loading')).toBeTruthy();
  await fireEvent.press(screen.getByText('Clear context'));
  await act(async () => finish(status));
  expect(await screen.findByText('none')).toBeTruthy(); expect(screen.queryByText('active')).toBeNull();
});
it('does not expose storage/provider errors and offers a safe status retry', async () => {
  const provider = api(); provider.status = jest.fn().mockRejectedValue(new Error('secret-provider-canary'));
  await render(<RegistrationProvider storage={storage()} createApi={() => provider}><RegistrationScreen go={jest.fn()} /></RegistrationProvider>);
  expect(await screen.findByText('Account setup is temporarily unavailable.')).toBeTruthy();
  expect(screen.queryByText('secret-provider-canary')).toBeNull(); expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
});
it('clears rejected backend credentials rather than treating presence as valid identity', async () => {
  const provider = api(); provider.status = jest.fn().mockRejectedValue(new ApiError('unauthenticated', 401));
  const store = storage(); const remove = jest.spyOn(store, 'clear');
  await render(<RegistrationProvider storage={store} createApi={() => provider}><Probe /></RegistrationProvider>);
  expect(await screen.findByText('none')).toBeTruthy(); expect(remove).toHaveBeenCalledTimes(1);
});
it('keeps completion disabled until backend-required verification is satisfied', async () => {
  const provider = api();
  await render(<RegistrationProvider storage={storage()} createApi={() => provider}><RegistrationScreen go={jest.fn()} /></RegistrationProvider>);
  const complete = await screen.findByRole('button', { name: 'Complete account setup' });
  expect(complete.props.accessibilityState.disabled).toBe(true);
  expect(screen.queryByLabelText(/age|birth|guardian/i)).toBeNull();
  await fireEvent.changeText(screen.getByLabelText('Full or display name'), '  New Member  ');
  await fireEvent.press(screen.getByRole('button', { name: 'Save name' }));
  expect(provider.profile).toHaveBeenCalledWith('New Member'); expect(provider.complete).not.toHaveBeenCalled();
});
it('requests verification SMS explicitly, clears transient code and avoids replay', async () => {
  const provider = api(); provider.checkPhone = jest.fn().mockRejectedValue(new ApiError('timeout'));
  await render(<RegistrationProvider storage={storage()} createApi={() => provider}><PhoneVerificationScreen back={jest.fn()} /></RegistrationProvider>);
  const phone = await screen.findByLabelText('India phone number (+91)');
  await fireEvent.changeText(phone, '9876543210'); await fireEvent.press(screen.getByRole('button', { name: 'Send verification SMS' }));
  expect(provider.phone).toHaveBeenCalledTimes(1); expect(provider.phone).toHaveBeenCalledWith('9876543210');
  await fireEvent.changeText(screen.getByLabelText('SMS verification code'), '123456');
  await fireEvent.press(screen.getByRole('button', { name: 'Check phone code' }));
  expect(await screen.findByText('The request timed out. Its outcome may be unknown.')).toBeTruthy();
  expect(provider.checkPhone).toHaveBeenCalledTimes(1); expect(screen.getByLabelText('SMS verification code').props.value).toBe('');
});
it('uses the emailed proof transiently and enforces the resend presentation wait', async () => {
  const provider = api();
  const used = jest.fn();
  function EmailLink() {
    const [authorization, setAuthorization] = useState<string | undefined>('A'.repeat(43));
    return <EmailVerificationScreen authorization={authorization} onAuthorizationUsed={() => { used(); setAuthorization(undefined); }} back={jest.fn()} />;
  }
  await render(<RegistrationProvider storage={storage()} createApi={() => provider}><EmailLink /></RegistrationProvider>);
  await fireEvent.press(await screen.findByRole('button', { name: 'Verify email' }));
  expect(provider.checkEmail).toHaveBeenCalledWith('A'.repeat(43)); expect(provider.checkEmail).toHaveBeenCalledTimes(1);
  expect(used).toHaveBeenCalledTimes(1);
  const send = await screen.findByRole('button', { name: 'Send verification email' }); await fireEvent.press(send);
  expect(provider.email).toHaveBeenCalledWith('member@example.test');
  expect(screen.getByRole('button', { name: /Resend available in/ }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Verify email' }).props.accessibilityState.disabled).toBe(true);
});
it('restores the resend wait from backend status without sending another SMS', async () => {
  const provider = api(); provider.status = jest.fn().mockResolvedValue({ ...status, phone: '+919876543210', phoneResendAt: new Date(Date.now() + 60_000).toISOString() });
  await render(<RegistrationProvider storage={storage()} createApi={() => provider}><PhoneVerificationScreen back={jest.fn()} /></RegistrationProvider>);
  expect((await screen.findByRole('button', { name: /Request available in/ })).props.accessibilityState.disabled).toBe(true);
  expect(provider.phone).not.toHaveBeenCalled();
});
it('recovers the committed email resend wait after failed delivery without replaying the send', async () => {
  const provider = api();
  provider.email = jest.fn().mockRejectedValue(new ApiError('unavailable', 503));
  provider.status = jest.fn().mockResolvedValueOnce(status).mockResolvedValue({ ...status, emailResendAt: new Date(Date.now() + 30_000).toISOString() });
  await render(<RegistrationProvider storage={storage()} createApi={() => provider}><EmailVerificationScreen back={jest.fn()} /></RegistrationProvider>);
  await fireEvent.press(await screen.findByRole('button', { name: 'Send verification email' }));
  expect(await screen.findByText('The service is temporarily unavailable.')).toBeTruthy();
  const retry = screen.getByRole('button', { name: /Resend available in/ });
  expect(retry.props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(retry);
  expect(provider.email).toHaveBeenCalledTimes(1); expect(provider.status).toHaveBeenCalledTimes(2);
});
