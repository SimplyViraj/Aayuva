import { fireEvent, render, screen } from '@testing-library/react-native';
import { StateNotice } from '../src/components/feedback/StateNotice';

it('exposes loading status to assistive technology', async () => {
  await render(<StateNotice kind="loading" message="Loading…" />);
  expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeTruthy();
});

it('announces an error and lets the caller retry', async () => {
  const retry = jest.fn();
  await render(<StateNotice kind="error" message="Please try again." onRetry={retry} />);
  expect(screen.getByRole('alert')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledTimes(1);
});

it('keeps denied access distinct from retryable failures', async () => {
  await render(<StateNotice kind="denied" message="You do not have access." onRetry={jest.fn()} />);
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
});
