import { act, fireEvent, render, screen } from '@testing-library/react-native';
import ManualRegistrationApp, { proofFromLink } from '../manual-app/ManualRegistrationApp';

jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: jest.requireActual('react-native').View, SafeAreaView: jest.requireActual('react-native').View }));
jest.mock('expo-secure-store', () => {
  let value: string | null = null;
  return { getItemAsync: jest.fn(async () => value), setItemAsync: jest.fn(async (_key: string, next: string) => { value = next; }), deleteItemAsync: jest.fn(async () => { value = null; }), WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device-only' };
});
it('uses the paired test connection and only a backend-issued capability to start onboarding', async () => {
  const fetcher = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ token: 'A'.repeat(43), expiresAt: '2100-01-01T00:00:00.000Z' }) } as Response)
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ stage: 'onboarding', displayName: null, phone: null, email: 'fixture@example.test', phoneVerified: false, emailVerified: false, emailRequired: true, expiresAt: '2100-01-01T00:00:00.000Z', phoneResendAt: null, emailResendAt: null }) } as Response);
  await render(<ManualRegistrationApp />);
  await fireEvent.changeText(screen.getByLabelText('Test API URL'), 'http://127.0.0.1:3001');
  await fireEvent.changeText(screen.getByLabelText('Private pairing key'), 'A'.repeat(43));
  await fireEvent.press(screen.getByRole('button', { name: 'Connect test app' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Start test registration' }));
  await act(async () => undefined);
  expect(await screen.findByRole('button', { name: 'Complete account setup' })).toBeTruthy();
  const options = fetcher.mock.calls[0]?.[1];
  expect(options?.headers).toEqual(expect.objectContaining({ 'X-Manual-Test-Key': 'A'.repeat(43) }));
  expect(options?.body).toBe('{}'); expect(options?.headers).not.toHaveProperty('Authorization');
});
it('extracts only a transient registration link proof and refuses extra fields', () => {
  expect(proofFromLink('aayuva://verify-email?authorization=' + 'A'.repeat(43))).toBe('A'.repeat(43));
  expect(() => proofFromLink('aayuva://verify-email?authorization=' + 'A'.repeat(43) + '&extra=1')).toThrow();
  expect(() => proofFromLink('file:///verify-email?authorization=' + 'A'.repeat(43))).toThrow();
});
it.each([['network', 'Cannot reach the test API. Check its URL, your network connection and Expo Go local-network permission.'], ['backend', 'The service is temporarily unavailable.']])('distinguishes %s failure and lets the owner correct the test connection without replay', async (kind, message) => {
  const secureStore = jest.requireMock('expo-secure-store'); await secureStore.deleteItemAsync();
  const fetcher = jest.spyOn(globalThis, 'fetch');
  if (kind === 'network') fetcher.mockRejectedValue(new TypeError('private-network-canary'));
  else fetcher.mockResolvedValue({ ok: false, status: 503 } as Response);
  await render(<ManualRegistrationApp />);
  await fireEvent.changeText(screen.getByLabelText('Test API URL'), 'http://127.0.0.1:3001');
  await fireEvent.changeText(screen.getByLabelText('Private pairing key'), 'A'.repeat(43));
  await fireEvent.press(screen.getByRole('button', { name: 'Connect test app' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Start test registration' }));
  expect(await screen.findByText(message)).toBeTruthy(); expect(fetcher).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('private-network-canary')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Change test connection' }));
  expect(await screen.findByLabelText('Test API URL')).toBeTruthy();
  expect(screen.getByLabelText('Private pairing key').props.value).toBe('');
  expect(fetcher).toHaveBeenCalledTimes(1);
});
