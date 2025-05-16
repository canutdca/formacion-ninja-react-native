import { ThemedText } from '@/components/ThemedText';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoadingScreenProps = {
  message: string;
};

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <SafeAreaView style={styles.loadingContainer} edges={['top']}>
      <ActivityIndicator size="large" />
      <ThemedText style={styles.loadingText}>{message}</ThemedText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
});
