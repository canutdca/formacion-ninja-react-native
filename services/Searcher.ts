import { CourseItemProps } from "@/components/CourseItem";
import { FilterOption, Filters } from "@/components/search/filters/FilterPanel";
import { SearcherFilter } from "./search-filter/SearcherFilter";
import { SearcherText } from "./search-text/SearcherText";


export class Searcher {
  private textSearchIndex: SearcherText;
  private filterManager: SearcherFilter;
  private documents: CourseItemProps[];

  constructor(documents: CourseItemProps[]) {
    this.documents = documents;
    this.textSearchIndex = new SearcherText(documents);
    this.filterManager = new SearcherFilter(documents);
  }

  search(query: string, filters: Filters): CourseItemProps[] {
    if (!query && !this.filterManager.hasActiveFilters(filters)) {
      return this.documents;
    }

    let resultIds = this.getResults(filters);
    return this.textSearchIndex.search(query, resultIds);
  }

  private getResults(filters: Filters): Set<string> {
    if (this.filterManager.hasActiveFilters(filters))
      return this.filterManager.filterDocuments(filters);
    return new Set(this.documents.map(doc => doc.id));
  }

  getSuggestions(query: string, limit = 5): string[] {
    return this.textSearchIndex.getSuggestions(query, limit);
  }

  getCategories(): FilterOption[] {
    return this.filterManager.getCategories();
  }

  getDurations(): FilterOption[] {
    return this.filterManager.getDurations();
  }

  getLevels(): FilterOption[] {
    return this.filterManager.getLevels();
  }
}
