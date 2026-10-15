import { router } from 'expo-router';
import { PhoneVerificationScreen } from '../src/features/auth/components/RegistrationScreens';

export default function VerifyPhoneRoute() { return <PhoneVerificationScreen back={() => router.replace('/register')} />; }
