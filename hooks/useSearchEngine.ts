import type { CourseItemProps } from '@/components/CourseItem';
import type { Filters } from '@/components/search/filters/FilterPanel';
import { Searcher } from '@/services/Searcher';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useSearchEngine(courses: CourseItemProps[]) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    durations: [],
    levels: [],
  });
  const [searchResults, setSearchResults] = useState<CourseItemProps[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const searcher = useMemo(() => new Searcher(courses), [courses]);

  const performSearch = useCallback(() => {
    setLoading(true);
    setSearchResults(searcher.search(query, filters));
    setLoading(false);
  }, [searcher, query, filters]);

  useEffect(() => {
    if (query.length >= 2) {
      setSearchSuggestions(searcher.getSuggestions(query));
      return
    }
    setSearchSuggestions([]);
  }, [query, searcher]);

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
    return searcher.getCategories();
  }, [searcher]);

  const getDurations = useCallback(() => {
    return searcher.getDurations();
  }, [searcher]);

  const getLevels = useCallback(() => {
    return searcher.getLevels();
  }, [searcher]);

  return {
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
    searchSuggestions,
  };
}
