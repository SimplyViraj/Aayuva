import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackendAccessBoundary, BackendAccessDecision } from '../src/providers/BackendAccessBoundary';

it.each(['signedOut', 'denied'] as const)('never renders protected content for %s', async (decision) => {
  await render(<BackendAccessBoundary checkAccess={async () => decision}><Text>Private content</Text></BackendAccessBoundary>);
  expect(screen.queryByText('Private content')).toBeNull();
});

it('renders content only after a successful backend decision', async () => {
  await render(<BackendAccessBoundary checkAccess={async () => 'allowed'}><Text>Private content</Text></BackendAccessBoundary>);
  expect(await screen.findByText('Private content')).toBeTruthy();
});

it('hides provider failures and permits explicit recovery', async () => {
  const check = jest.fn<Promise<BackendAccessDecision>, []>().mockRejectedValueOnce(new Error('secret-canary')).mockResolvedValue('allowed');
  await render(<BackendAccessBoundary checkAccess={check}><Text>Private content</Text></BackendAccessBoundary>);
  expect(await screen.findByText('Access could not be checked. Please try again.')).toBeTruthy();
  expect(screen.queryByText('secret-canary')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Private content')).toBeTruthy();
});

it('does not restore an obsolete decision when the backend checker changes', async () => {
  let finish: (value: BackendAccessDecision) => void = () => undefined;
  const old = () => new Promise<BackendAccessDecision>((resolve) => { finish = resolve; });
  const view = await render(<BackendAccessBoundary checkAccess={old}><Text>Private content</Text></BackendAccessBoundary>);
  await view.rerender(<BackendAccessBoundary checkAccess={async () => 'denied'}><Text>Private content</Text></BackendAccessBoundary>);
  await act(async () => finish('allowed'));
  expect(screen.queryByText('Private content')).toBeNull();
});

it('sanitizes a synchronous backend-checker exception', async () => {
  await render(<BackendAccessBoundary checkAccess={() => { throw new Error('secret-canary'); }}><Text>Private content</Text></BackendAccessBoundary>);
  expect(await screen.findByText('Access could not be checked. Please try again.')).toBeTruthy();
  expect(screen.queryByText('Private content')).toBeNull();
});
