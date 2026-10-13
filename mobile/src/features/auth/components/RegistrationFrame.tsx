import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RegistrationFrame({ title, children }: { title: string; children: ReactNode }) {
  return <SafeAreaView style={styles.page}><KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.heading}>{title}</Text>{children}
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
export function RegistrationField({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} style={styles.input} {...props} /></View>;
}
export function RegistrationButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress(): void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}
export const registrationStyles = StyleSheet.create({ text: { fontSize: 16, lineHeight: 24, color: '#243A31', marginVertical: 8 } });
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F8F5' }, content: { padding: 24, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  heading: { fontSize: 28, fontWeight: '700', color: '#174B35' }, field: { gap: 8 }, label: { fontSize: 16, color: '#243A31' },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#48695A', borderRadius: 8, padding: 12, fontSize: 18, color: '#142E21', backgroundColor: '#FFF' },
  button: { minHeight: 48, padding: 14, borderRadius: 8, backgroundColor: '#174B35', justifyContent: 'center' }, disabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
