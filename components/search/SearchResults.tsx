import { CourseItem, CourseItemProps } from '@/components/CourseItem';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Filters } from './filters/FilterPanel';

type SearchResultsProps = {
  results: CourseItemProps[];
  isSearching: boolean;
  searchQuery: string;
  filters: Filters;
};

const EmptyList = ({ searchQuery, filters }: { searchQuery: string, filters: Filters }) => {
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
};

export function SearchResults({
  results,
  isSearching,
  searchQuery,
  filters,
}: SearchResultsProps) {
  const renderItem = ({ item }: { item: CourseItemProps }) => {
    return (
      <CourseItem
        id={item.id}
        title={item.title}
        category={item.category}
        instructor={item.instructor}
        duration={item.duration}
        thumbnail={item.thumbnail}
        viewCount={item.viewCount}
        onPress={() => console.log(`Curso seleccionado: ${item.id}`)}
      />
    );
  };

  const keyExtractor = (item: CourseItemProps) => item.id;

  const ListHeader = () => {
    return results.length > 0 ? (
      <ThemedText style={styles.resultsCount}>
        {results.length} {results.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
      </ThemedText>
    ) : null;
  };

  const LoadingView = () => (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
      <ThemedText style={styles.loadingText}>Buscando cursos...</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {isSearching ? (
        <LoadingView />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => <EmptyList searchQuery={searchQuery} filters={filters} />}
          ListHeaderComponent={ListHeader}
          initialNumToRender={20}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 20,
    minHeight: '100%',
  },
  resultsCount: {
    marginBottom: 16,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
  },
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
