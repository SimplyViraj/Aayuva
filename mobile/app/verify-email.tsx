import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { EmailVerificationScreen } from '../src/features/auth/components/RegistrationScreens';

export default function VerifyEmailRoute() {
  const params = useLocalSearchParams<{ authorization?: string | string[] }>();
  const [authorization, setAuthorization] = useState<string>();
  useEffect(() => {
    if (typeof params.authorization === 'string' && /^[A-Za-z0-9_-]{43}$/.test(params.authorization)) {
      setAuthorization(params.authorization);
      // Proof is transient component state, never secure/local storage or logs.
      router.setParams({ authorization: undefined });
    }
  }, [params.authorization]);
  return <EmailVerificationScreen authorization={authorization} onAuthorizationUsed={() => setAuthorization(undefined)} back={() => { setAuthorization(undefined); router.replace('/register'); }} />;
}
