import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Filters } from '../filters/FilterPanel';

export const EmptyList = memo(function EmptyList({ searchQuery, filters }: { searchQuery: string, filters: Filters }) {
  const hasActiveSearch = searchQuery.length > 0;
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.durations.length > 0 ||
    filters.levels.length > 0;

  if (hasActiveSearch || hasActiveFilters) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyTitle}>No se encontraron cursos</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Prueba con otros términos de búsqueda o filtros diferentes
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>Explora los cursos disponibles</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Usa el buscador o los filtros para encontrar cursos
      </ThemedText>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
