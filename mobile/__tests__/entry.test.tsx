import { render, screen } from '@testing-library/react-native';
import EntryScreen from '../app/index';

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native');
  return { SafeAreaView: View };
});

it('renders the accessible application entry', async () => {
  await render(<EntryScreen />);
  expect(screen.getByRole('header', { name: 'AAyuva' })).toBeTruthy();
});
