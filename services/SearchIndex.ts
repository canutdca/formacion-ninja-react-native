import { CourseItemProps } from "@/components/CourseItem";
import { FilterOption, Filters } from "@/components/search/filters/FilterPanel";

export class SearchIndex {
  private documents: CourseItemProps[] = [];
  private invertedIndex: Record<string, Set<string>> = {};
  private documentMap: Record<string, CourseItemProps> = {};
  private categoryMap: Record<string, FilterOption> = {};
  private durationMap: Record<string, FilterOption> = {};
  private levelMap: Record<string, FilterOption> = {};
  private tokenCache: Map<string, string[]> = new Map();
  private distanceCache: Map<string, number> = new Map();
  private readonly MAX_FUZZY_DISTANCE = 1;
  private readonly MAX_FUZZY_RESULTS = 20;
  private readonly MIN_TOKEN_LENGTH = 3;

  constructor(documents: CourseItemProps[]) {
    this.documents = documents.map(doc => ({
      ...doc,
      durationMinutes: this.durationToMinutes(doc.duration)
    }));
    this.buildIndex();
    this.buildCategoryMap();
    this.buildDurationMap();
    this.buildLevelMap();
  }

  private buildIndex(): void {
    this.documents.forEach(doc => {
      this.documentMap[doc.id] = doc;

      const titleTokens = this.getCachedTokens(doc.title);
      const categoryTokens = this.getCachedTokens(doc.category);
      const instructorTokens = this.getCachedTokens(doc.instructor);

      this.indexTokens(titleTokens, doc.id);
      this.indexTokens(categoryTokens, doc.id);
      this.indexTokens(instructorTokens, doc.id);
    });
  }

  private getCachedTokens(text: string): string[] {
    const cached = this.tokenCache.get(text);
    if (cached) return cached;

    const tokens = this.tokenize(text);
    this.tokenCache.set(text, tokens);
    return tokens;
  }

  private indexTokens(tokens: string[], docId: string): void {
    tokens.forEach(token => {
      if (!this.invertedIndex[token]) {
        this.invertedIndex[token] = new Set<string>();
      }
      this.invertedIndex[token].add(docId);
    });
  }

  private buildCategoryMap(): void {
    const categories = new Map<string, number>();

    this.documents.forEach(doc => {
      if (!categories.has(doc.category)) {
        categories.set(doc.category, 0);
      }
      categories.set(doc.category, categories.get(doc.category)! + 1);
    });

    categories.forEach((count, category) => {
      const id = this.normalizeForId(category);
      this.categoryMap[id] = {
        id,
        label: category,
        count,
      };
    });
  }

  private buildDurationMap(): void {
    const durationRanges = {
      'short': { id: 'short', label: 'Corta (< 3h)', min: 0, max: 180, count: 0 },
      'medium': { id: 'medium', label: 'Media (3-6h)', min: 180, max: 360, count: 0 },
      'long': { id: 'long', label: 'Larga (> 6h)', min: 360, max: Infinity, count: 0 },
    };

    this.documents.forEach(doc => {
      const minutes = this.durationToMinutes(doc.duration);

      if (minutes < 180) {
        durationRanges.short.count++;
      } else if (minutes < 360) {
        durationRanges.medium.count++;
      } else {
        durationRanges.long.count++;
      }
    });

    Object.values(durationRanges).forEach(range => {
      this.durationMap[range.id] = {
        id: range.id,
        label: range.label,
        count: range.count,
      };
    });
  }

  private buildLevelMap(): void {
    const levels = {
      'beginner': { id: 'beginner', label: 'Principiante', count: 0 },
      'intermediate': { id: 'intermediate', label: 'Intermedio', count: 0 },
      'advanced': { id: 'advanced', label: 'Avanzado', count: 0 },
    };

    this.documents.forEach(doc => {
      if (doc.title.toLowerCase().includes('básico') || doc.title.toLowerCase().includes('introducción')) {
        levels.beginner.count++;
      } else if (doc.title.toLowerCase().includes('avanzado') || doc.title.toLowerCase().includes('superior')) {
        levels.advanced.count++;
      } else {
        levels.intermediate.count++;
      }
    });

    Object.values(levels).forEach(level => {
      this.levelMap[level.id] = {
        id: level.id,
        label: level.label,
        count: level.count,
      };
    });
  }

  private durationToMinutes(duration: string): number {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\sáéíóúüñ]/g, '')
      .split(/\s+/)
      .filter(token => token.length >= 2)
      .map(token => this.stemWord(token));
  }

  private normalizeForId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w]/g, '_');
  }

  private stemWord(word: string): string {
    if (word.endsWith('es') && word.length > 4) {
      word = word.slice(0, -2);
    } else if (word.endsWith('s') && word.length > 3) {
      word = word.slice(0, -1);
    }

    const suffixes = ['ción', 'ciones', 'mente', 'dad', 'dades', 'ando', 'endo', 'ado', 'ido', 'aba', 'ía'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        word = word.slice(0, -suffix.length);
        break;
      }
    }

    return word;
  }

  private levenshteinDistance(a: string, b: string): number {
    // Optimization: if strings are identical, distance is 0
    if (a === b) return 0;

    // Optimization: if one string is empty, distance is the length of the other one
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    // Optimization: if the length difference is greater than maxDistance,
    // the distance will be greater than maxDistance
    const maxDistance = this.MAX_FUZZY_DISTANCE;
    if (Math.abs(a.length - b.length) > maxDistance) {
      return maxDistance + 1;
    }

    const matrix: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  }

  search(query: string, filters: Filters): CourseItemProps[] {
    if (!query && !this.hasActiveFilters(filters)) {
      return this.documents;
    }

    let resultIds: Set<string> = new Set();

    // If there are active filters, apply them first
    if (this.hasActiveFilters(filters)) {
      // Apply filters to all documents
      this.documents.forEach(doc => {
        if (this.matchesFilters(doc, filters)) {
          resultIds.add(doc.id);
        }
      });
    } else {
      // If there are no filters, include all documents
      this.documents.forEach(doc => resultIds.add(doc.id));
    }

    // If there is a query, search only in filtered documents
    if (query) {
      const queryTokens = this.tokenize(query);
      const filteredResults = new Set<string>();

      // Exact search in filtered documents
      const exactMatches = this.exactSearch(queryTokens);
      exactMatches.forEach(id => {
        if (resultIds.has(id)) {
          filteredResults.add(id);
        }
      });

      // If there aren't enough exact matches, perform fuzzy search
      if (filteredResults.size < 10) {
        const fuzzyMatches = this.fuzzySearch(queryTokens);
        fuzzyMatches.forEach(id => {
          if (resultIds.has(id)) {
            filteredResults.add(id);
          }
        });
      }

      resultIds = filteredResults;
    }

    const results = Array.from(resultIds).map(id => this.documentMap[id]);
    return results.sort((a, b) => a.title.localeCompare(b.title));
  }

  private matchesFilters(doc: CourseItemProps & { durationMinutes?: number }, filters: Filters): boolean {
    if (filters.categories.length > 0) {
      const categoryId = this.normalizeForId(doc.category);
      if (!filters.categories.includes(categoryId)) {
        return false;
      }
    }

    if (filters.durations.length > 0) {
      // Use the precalculated value if it exists
      const minutes = doc.durationMinutes !== undefined ? doc.durationMinutes : this.durationToMinutes(doc.duration);
      const durationMatch = filters.durations.some(durationId => {
        if (durationId === 'short') return minutes < 180;
        if (durationId === 'medium') return minutes >= 180 && minutes < 360;
        if (durationId === 'long') return minutes >= 360;
        return false;
      });

      if (!durationMatch) return false;
    }

    if (filters.levels.length > 0) {
      let level = 'intermediate';
      if (doc.title.toLowerCase().includes('básico') || doc.title.toLowerCase().includes('introducción')) {
        level = 'beginner';
      } else if (doc.title.toLowerCase().includes('avanzado') || doc.title.toLowerCase().includes('superior')) {
        level = 'advanced';
      }

      if (!filters.levels.includes(level)) {
        return false;
      }
    }

    return true;
  }

  private hasActiveFilters(filters: Filters): boolean {
    return (
      filters.categories.length > 0 ||
      filters.durations.length > 0 ||
      filters.levels.length > 0
    );
  }

  private exactSearch(queryTokens: string[]): string[] {
    const token = queryTokens[0];
    let matchingDocIds = new Set<string>();

    if (this.invertedIndex[token]) {
      this.invertedIndex[token].forEach(id => matchingDocIds.add(id));
    }

    for (let i = 1; i < queryTokens.length; i++) {
      const token = queryTokens[i];

      if (!this.invertedIndex[token]) continue;

      matchingDocIds = new Set(
        Array.from(matchingDocIds).filter(id =>
          this.invertedIndex[token].has(id)
        )
      );
    }

    return Array.from(matchingDocIds);
  }

  private fuzzySearch(queryTokens: string[]): string[] {
    const fuzzyMatches = new Set<string>();
    const allTokens = Object.keys(this.invertedIndex);

    // Filter tokens by length to reduce comparisons
    const relevantTokens = allTokens.filter(token =>
      token.length >= this.MIN_TOKEN_LENGTH
    );

    for (const queryToken of queryTokens) {
      if (queryToken.length < this.MIN_TOKEN_LENGTH) continue;
      if (fuzzyMatches.size >= this.MAX_FUZZY_RESULTS) break;

      const maxDistance = Math.min(
        this.MAX_FUZZY_DISTANCE,
        Math.floor(queryToken.length / 3)
      );

      // Sort tokens by similarity to process the most likely ones first
      const candidates = this.findFuzzyCandidates(queryToken, relevantTokens, maxDistance);

      for (const candidate of candidates) {
        if (fuzzyMatches.size >= this.MAX_FUZZY_RESULTS) break;
        this.invertedIndex[candidate].forEach(id => fuzzyMatches.add(id));
      }
    }

    return Array.from(fuzzyMatches);
  }

  private findFuzzyCandidates(
    queryToken: string,
    tokens: string[],
    maxDistance: number
  ): string[] {
    // First try exact matches or prefixes
    const exactMatches = tokens.filter(token =>
      token === queryToken || token.startsWith(queryToken)
    );
    if (exactMatches.length > 0) return exactMatches;

    // If there are no exact matches, look for fuzzy matches
    return tokens
      .filter(token => {
        // Calculate distance only if lengths are similar
        if (Math.abs(token.length - queryToken.length) > maxDistance) {
          return false;
        }
        const distance = this.getCachedDistance(queryToken, token);
        return distance <= maxDistance;
      })
      .sort((a, b) => {
        // Sort by distance
        const distA = this.getCachedDistance(queryToken, a);
        const distB = this.getCachedDistance(queryToken, b);
        return distA - distB;
      });
  }

  private getCachedDistance(a: string, b: string): number {
    // Sort strings to have a consistent key
    const [str1, str2] = [a, b].sort();
    const cacheKey = `${str1}:${str2}`;

    const cached = this.distanceCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const distance = this.levenshteinDistance(str1, str2);
    this.distanceCache.set(cacheKey, distance);
    return distance;
  }

  getSuggestions(query: string, limit = 5): string[] {
    if (!query) return [];

    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0) return [];

    const firstToken = queryTokens[0];
    const suggestions = new Set<string>();

    this.documents.forEach(doc => {
      const docTokens = this.tokenize(doc.title);

      for (const token of docTokens) {
        if (token.startsWith(firstToken)) {
          suggestions.add(doc.title);
          if (suggestions.size >= limit) break;
        }
      }
    });

    if (suggestions.size < limit) {
      const fuzzyResults = this.fuzzySearch(queryTokens);

      for (const id of fuzzyResults) {
        suggestions.add(this.documentMap[id].title);
        if (suggestions.size >= limit) break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  getCategories(): FilterOption[] {
    return Object.values(this.categoryMap);
  }

  getDurations(): FilterOption[] {
    return Object.values(this.durationMap);
  }

  getLevels(): FilterOption[] {
    return Object.values(this.levelMap);
  }
}
