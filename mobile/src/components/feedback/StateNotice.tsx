import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface StateNoticeProps {
  kind: 'loading' | 'error' | 'empty' | 'success' | 'denied';
  message: string;
  onRetry?: () => void;
}

// Callers supply reviewed user-facing messages, never raw provider/error bodies.
export function StateNotice({ kind, message, onRetry }: StateNoticeProps) {
  const failed = kind === 'error' || kind === 'denied';
  return (
    <View style={styles.container}>
      {kind === 'loading' && <ActivityIndicator accessible accessibilityRole="progressbar" accessibilityLabel="Loading" color="#174F3D" />}
      <Text accessibilityRole={failed ? 'alert' : 'text'} accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
      {kind === 'error' && onRetry && (
        <Pressable accessibilityRole="button" accessibilityLabel="Try again" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16, alignItems: 'center' },
  message: { fontSize: 16, color: '#20372D', textAlign: 'center' },
  button: { minHeight: 48, minWidth: 48, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#174F3D', borderRadius: 8 },
  buttonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
});
