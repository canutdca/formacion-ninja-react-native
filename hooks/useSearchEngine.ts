import type { CourseItemProps } from '@/components/CourseItem';
import type { Filters } from '@/components/search/filters/FilterPanel';
import { SearchIndex } from '@/services/SearchIndex';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useSearchEngine(courses: CourseItemProps[]) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    durations: [],
    levels: [],
  });
  const [searchResults, setSearchResults] = useState<CourseItemProps[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const searchIndex = useMemo(() => new SearchIndex(courses), [courses]);

  const performSearch = useCallback(() => {
    setIsSearching(true);

    setTimeout(() => {
      const results = searchIndex.search(query, filters);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchIndex, query, filters]);

  useEffect(() => {
    if (query.length >= 2) {
      const suggestions = searchIndex.getSuggestions(query);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [query, searchIndex]);

  useEffect(() => {
    performSearch();
  }, [filters, performSearch]);

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      durations: [],
      levels: [],
    });
  }, []);

  const getCategories = useCallback(() => {
    return searchIndex.getCategories();
  }, [searchIndex]);

  const getDurations = useCallback(() => {
    return searchIndex.getDurations();
  }, [searchIndex]);

  const getLevels = useCallback(() => {
    return searchIndex.getLevels();
  }, [searchIndex]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    searchResults,
    isSearching,
    performSearch,
    getCategories,
    getDurations,
    getLevels,
    clearFilters,
    searchSuggestions,
  };
}
