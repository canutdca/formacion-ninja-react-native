import { CourseItem, CourseItemProps } from '@/components/CourseItem';
import { ThemedView } from '@/components/ThemedView';
import { FlatList, StyleSheet } from 'react-native';
import { LoadingScreen } from '../ui/LoadingScreen';
import { Filters } from './filters/FilterPanel';
import { EmptyList } from './results/EmptyList';
import { ListHeader } from './results/ListHeader';

type SearchResultsProps = {
  results: CourseItemProps[];
  isSearching: boolean;
  searchQuery: string;
  filters: Filters;
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

  return (
    <ThemedView style={styles.container}>
      {isSearching ? (
        <LoadingScreen message="Buscando cursos..." />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => <EmptyList searchQuery={searchQuery} filters={filters} />}
          ListHeaderComponent={<ListHeader resultsCount={results.length} />}
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
});
