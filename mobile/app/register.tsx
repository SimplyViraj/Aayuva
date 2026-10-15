import { router } from 'expo-router';
import { RegistrationScreen } from '../src/features/auth/components/RegistrationScreens';

export default function RegisterRoute() {
  return <RegistrationScreen go={(destination) => router.replace(destination === 'phone' ? '/verify-phone' : destination === 'email' ? '/verify-email' : '/')} />;
}
