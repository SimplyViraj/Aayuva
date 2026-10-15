import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SocialSignIn } from '../src/features/auth/components/SocialSignIn';
import { SocialCancelled } from '../src/features/auth/services/native-social';
import { ApiError } from '../src/lib/api/client';
import type { SocialApi } from '../src/features/auth/services/social-api';

const mockBegin = jest.fn().mockResolvedValue(undefined);
jest.mock('../src/providers/RegistrationProvider', () => ({ useOptionalRegistration: () => ({ begin: mockBegin }) }));
const expiresAt = new Date(Date.now() + 900_000).toISOString();
const flow = { token: 'A'.repeat(43), nonce: 'a'.repeat(64), expiresAt };
const available = { platform: 'IOS' as const, google: true, apple: true };
function api(): SocialApi {
  return { start: jest.fn().mockResolvedValue(flow), complete: jest.fn().mockResolvedValue({ kind: 'session', accessToken: 'fixture.access.signature', expiresAt }),
    context: jest.fn().mockResolvedValue({ displayName: 'Member' }), logout: jest.fn().mockResolvedValue(undefined) };
}
it('keeps unconfigured methods disabled without loading or calling a provider', async () => {
  const provider = api(); const authenticate = jest.fn();
  await render(<SocialSignIn api={provider} authenticate={authenticate} availability={{ ...available, google: false, apple: false }} />);
  expect(screen.getByRole('button', { name: 'Continue with Google' }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByText('Social sign-in is not configured for this build.')).toBeTruthy();
  expect(authenticate).not.toHaveBeenCalled(); expect(provider.start).not.toHaveBeenCalled();
});
it('handles provider cancellation without submitting evidence or authenticating', async () => {
  const provider = api();
  await render(<SocialSignIn api={provider} authenticate={jest.fn().mockRejectedValue(new SocialCancelled())} availability={available} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Continue with Google' }));
  expect(await screen.findByText('Sign-in cancelled.')).toBeTruthy(); expect(provider.complete).not.toHaveBeenCalled();
});
it('starts backend-issued onboarding rather than declaring a new provider identity signed in', async () => {
  const provider = api(); provider.complete = jest.fn().mockResolvedValue({ kind: 'onboarding', token: flow.token, expiresAt });
  await render(<SocialSignIn api={provider} authenticate={jest.fn().mockResolvedValue({ idToken: 'transient.provider.token' })} availability={available} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Continue with Apple' }));
  await act(async () => undefined);
  expect(provider.start).toHaveBeenCalledWith('APPLE', 'IOS');
  expect(provider.complete).toHaveBeenCalledWith(flow.token, 'transient.provider.token', undefined);
  expect(mockBegin).toHaveBeenCalledWith({ kind: 'onboarding', token: flow.token, expiresAt }); expect(provider.context).not.toHaveBeenCalled();
  expect(screen.queryByText(/Signed in as/)).toBeNull();
});
it('requires backend context and confirmed logout; uncertainty never acknowledges sign-out', async () => {
  const provider = api(); provider.logout = jest.fn().mockRejectedValueOnce(new ApiError('timeout')).mockResolvedValue(undefined);
  await render(<SocialSignIn api={provider} authenticate={jest.fn().mockResolvedValue({ idToken: 'transient.provider.token' })} availability={available} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Continue with Google' }));
  expect(await screen.findByText('Signed in as Member.')).toBeTruthy(); expect(provider.context).toHaveBeenCalledWith('fixture.access.signature');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByText('The request timed out. Its outcome may be unknown.')).toBeTruthy(); expect(screen.queryByText('Signed out.')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Sign out' })); expect(await screen.findByText('Signed out.')).toBeTruthy(); expect(provider.logout).toHaveBeenCalledTimes(2);
});
it('does not render authenticated state after failed backend confirmation or leak failures', async () => {
  const provider = api(); provider.context = jest.fn().mockRejectedValue(new Error('private-provider-canary'));
  await render(<SocialSignIn api={provider} authenticate={jest.fn().mockResolvedValue({ idToken: 'transient.provider.token' })} availability={{ ...available, platform: 'ANDROID', apple: false }} />);
  expect(screen.queryByRole('button', { name: 'Continue with Apple' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Continue with Google' }));
  expect(await screen.findByText('Sign-in is temporarily unavailable.')).toBeTruthy(); expect(screen.queryByText(/Signed in as|private-provider-canary/)).toBeNull();
});
it('suppresses duplicate presses and stops an obsolete flow before native interaction', async () => {
  const provider = api(); let finish: (value: typeof flow) => void = () => undefined;
  provider.start = jest.fn().mockImplementation(() => new Promise((resolve) => { finish = resolve; })); const authenticate = jest.fn();
  const view = await render(<SocialSignIn api={provider} authenticate={authenticate} availability={available} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Continue with Google' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Continue with Google' }));
  expect(provider.start).toHaveBeenCalledTimes(1);
  await view.unmount(); await act(async () => finish(flow)); expect(authenticate).not.toHaveBeenCalled(); expect(provider.complete).not.toHaveBeenCalled();
});
