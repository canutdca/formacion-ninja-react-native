import { ThemedText } from '@/components/ThemedText';
import { StyleSheet } from 'react-native';

export function ListHeader({resultsCount}: {resultsCount: number}) {
  return resultsCount > 0 ? (
    <ThemedText style={styles.resultsCount}>
      {resultsCount} {resultsCount === 1 ? 'curso encontrado' : 'cursos encontrados'}
    </ThemedText>
  ) : null;
};

const styles = StyleSheet.create({
  resultsCount: {
    marginBottom: 16,
    opacity: 0.7,
  },
});
