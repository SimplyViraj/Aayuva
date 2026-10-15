import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useOptionalRegistration } from '../src/providers/RegistrationProvider';
import { StateNotice } from '../src/components/feedback/StateNotice';
import { SocialSignIn } from '../src/features/auth/components/SocialSignIn';

export default function EntryScreen() {
  const registration = useOptionalRegistration();
  if (registration?.phase === 'active') return <Redirect href="/register" />;
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>AAyuva</Text>
        {registration?.phase === 'loading' && <StateNotice kind="loading" message="Checking account setup…" />}
        {registration?.phase === 'unavailable' && <StateNotice kind="error" message="Account setup is temporarily unavailable." onRetry={() => { void registration.refresh(); }} />}
        {(!registration || registration.phase === 'none') && <SocialSignIn />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAF8' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#174F3D', fontSize: 36, fontWeight: '700' },
});
