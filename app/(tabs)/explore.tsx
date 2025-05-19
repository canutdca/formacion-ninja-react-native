import { FilterPanel } from '@/components/search/filters/FilterPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { COURSES_DATA } from '@/constants/CoursesData';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { useSearchEngine } from '@/hooks/useSearchEngine';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const {
    query,
    setQuery,
    filters,
    setFilters,
    searchResults,
    loading,
    performSearch,
    getCategories,
    getDurations,
    getLevels,
    clearFilters,
    searchSuggestions
  } = useSearchEngine(COURSES_DATA);

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.durations.length > 0 ||
      filters.levels.length > 0
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Explorar Cursos</ThemedText>
        <ThemedText style={styles.subtitle}>
          Busca entre miles de cursos para oposiciones
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchSection}>
        <ThemedView style={styles.searcherContainer}>
          <ThemedView style={styles.searchBarContainer}>
            <SearchBar
              query={query}
              onChangeQuery={setQuery}
              onSearch={performSearch}
              suggestions={searchSuggestions}
            />
          </ThemedView>
          <ThemedText
            style={styles.filtersToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <IconSymbol
              name={hasActiveFilters()
                ? "line.horizontal.3.decrease.circle.fill"
                : "line.horizontal.3.decrease.circle"}
              size={20}
              color={Colors[colorScheme].icon}
            />
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <FilterPanel
        categories={getCategories()}
        durations={getDurations()}
        levels={getLevels()}
        selectedFilters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />

      <ThemedView style={styles.resultsContainer}>
        <SearchResults
          results={searchResults}
          loading={loading}
          searchQuery={query}
          filters={filters}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  searchSection: {
    position: 'relative',
    zIndex: 20,
  },
  searcherContainer: {
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchBarContainer: {
    flex: 1,
  },
  filtersToggle: {
    color: '#0a7ea4',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  resultsContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});
