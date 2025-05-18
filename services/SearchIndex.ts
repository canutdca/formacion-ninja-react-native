import { CourseItemProps } from "@/components/CourseItem";
import { FilterOption, Filters } from "@/components/search/filters/FilterPanel";

export class SearchIndex {
  private documents: CourseItemProps[] = [];
  private invertedIndex: Record<string, Set<string>> = {};
  private documentMap: Record<string, CourseItemProps> = {};
  private categoryMap: Record<string, FilterOption> = {};
  private durationMap: Record<string, FilterOption> = {};
  private levelMap: Record<string, FilterOption> = {};

  constructor(documents: CourseItemProps[]) {
    this.documents = documents;
    this.buildIndex();
    this.buildCategoryMap();
    this.buildDurationMap();
    this.buildLevelMap();
  }

  private buildIndex(): void {
    this.documents.forEach(doc => {
      this.documentMap[doc.id] = doc;

      const tokens = this.tokenize(doc.title + ' ' + doc.category + ' ' + doc.instructor);

      tokens.forEach(token => {
        if (!this.invertedIndex[token]) {
          this.invertedIndex[token] = new Set<string>();
        }
        this.invertedIndex[token].add(doc.id);
      });
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

    if (query) {
      const queryTokens = this.tokenize(query);

      const exactMatches = this.exactSearch(queryTokens);
      exactMatches.forEach(id => resultIds.add(id));

      if (resultIds.size < 10) {
        const fuzzyMatches = this.fuzzySearch(queryTokens);
        fuzzyMatches.forEach(id => resultIds.add(id));
      }
    } else {
      this.documents.forEach(doc => resultIds.add(doc.id));
    }

    if (this.hasActiveFilters(filters)) {
      resultIds = this.applyFilters(resultIds, filters);
    }

    const results = Array.from(resultIds).map(id => this.documentMap[id]);

    return results.sort((a, b) => a.title.localeCompare(b.title));
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

    queryTokens.forEach(queryToken => {
      const maxDistance = Math.min(2, Math.floor(queryToken.length / 3));

      allTokens.forEach(indexToken => {
        const distance = this.levenshteinDistance(queryToken, indexToken);

        if (distance <= maxDistance) {
          this.invertedIndex[indexToken].forEach(id => fuzzyMatches.add(id));
        }
      });
    });

    return Array.from(fuzzyMatches);
  }

  private applyFilters(resultIds: Set<string>, filters: Filters): Set<string> {
    return new Set(
      Array.from(resultIds).filter(id => {
        const doc = this.documentMap[id];

        if (filters.categories.length > 0) {
          const categoryId = this.normalizeForId(doc.category);
          if (!filters.categories.includes(categoryId)) {
            return false;
          }
        }

        if (filters.durations.length > 0) {
          const minutes = this.durationToMinutes(doc.duration);
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
      })
    );
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
