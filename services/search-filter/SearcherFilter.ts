import { CourseItemProps } from "@/components/CourseItem";
import { FilterOption, Filters } from "@/components/search/filters/FilterPanel";
import { CategoryFilterStrategy } from "./CategoryFilterStrategy";
import { DurationFilterStrategy } from "./DurationFilterStrategy";
import { LevelFilterStrategy } from "./LevelFilterStrategy";

export type CourseItemWithDuration = CourseItemProps & { durationMinutes?: number };

export class SearcherFilter {
  private documents: CourseItemWithDuration[];
  private categoryStrategy: CategoryFilterStrategy;
  private durationStrategy: DurationFilterStrategy;
  private levelStrategy: LevelFilterStrategy;

  constructor(documents: CourseItemProps[]) {
    this.documents = documents.map(doc => ({
      ...doc,
      durationMinutes: this.durationToMinutes(doc.duration)
    }));

    this.categoryStrategy = new CategoryFilterStrategy();
    this.durationStrategy = new DurationFilterStrategy();
    this.levelStrategy = new LevelFilterStrategy();

    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.categoryStrategy.buildMap(this.documents);
    this.durationStrategy.buildMap(this.documents);
    this.levelStrategy.buildMap(this.documents);
  }

  private durationToMinutes(duration: string): number {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  filterDocuments(filters: Filters): Set<string> {
    const resultIds = new Set<string>();

    this.documents.forEach(doc => {
      if (this.matchesFilters(doc, filters)) {
        resultIds.add(doc.id);
      }
    });

    return resultIds;
  }

  private matchesFilters(doc: CourseItemWithDuration, filters: Filters): boolean {
    return (
      this.categoryStrategy.matchesFilter(doc, filters.categories) &&
      this.durationStrategy.matchesFilter(doc, filters.durations) &&
      this.levelStrategy.matchesFilter(doc, filters.levels)
    );
  }

  hasActiveFilters(filters: Filters): boolean {
    return (
      this.categoryStrategy.hasActiveFilters(filters.categories) ||
      this.durationStrategy.hasActiveFilters(filters.durations) ||
      this.levelStrategy.hasActiveFilters(filters.levels)
    );
  }

  getCategories(): FilterOption[] {
    return this.categoryStrategy.getOptions();
  }

  getDurations(): FilterOption[] {
    return this.durationStrategy.getOptions();
  }

  getLevels(): FilterOption[] {
    return this.levelStrategy.getOptions();
  }
}
