import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RegistrationProvider } from '../src/providers/RegistrationProvider';

export default function RootLayout() {
  return (
    <RegistrationProvider><SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider></RegistrationProvider>
  );
}
