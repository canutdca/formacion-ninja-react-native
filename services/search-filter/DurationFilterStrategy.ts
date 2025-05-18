import { FilterOption } from "@/components/search/filters/FilterPanel";
import { FilterStrategy } from "./FilterStrategy";
import { CourseItemWithDuration } from "./SearcherFilter";

export enum CourseDuration {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long'
}

interface DurationOption extends FilterOption {
  id: string;
  count: number;
  min: number;
  max: number;
}

export class DurationFilterStrategy implements FilterStrategy {
  private durationMap: Record<string, DurationOption> = {
    [CourseDuration.SHORT]: {
      id: CourseDuration.SHORT,
      label: 'Corta (< 3h)',
      min: 0,
      max: 180,
      count: 0
    },
    [CourseDuration.MEDIUM]: {
      id: CourseDuration.MEDIUM,
      label: 'Media (3-6h)',
      min: 180,
      max: 360,
      count: 0
    },
    [CourseDuration.LONG]: {
      id: CourseDuration.LONG,
      label: 'Larga (> 6h)',
      min: 360,
      max: Infinity,
      count: 0
    },
  };

  buildMap(documents: CourseItemWithDuration[]): void {
    Object.values(this.durationMap).forEach(duration => {
      duration.count = 0;
    });

    documents.forEach(doc => {
      const minutes = doc.durationMinutes!;
      if (minutes < 180) {
        this.durationMap[CourseDuration.SHORT].count++;
        return;
      }
      if (minutes < 360) {
        this.durationMap[CourseDuration.MEDIUM].count++;
        return;
      }
      this.durationMap[CourseDuration.LONG].count++;
    });
  }

  matchesFilter(doc: CourseItemWithDuration, filterIds: string[]): boolean {
    if (filterIds.length === 0) return true;
    const minutes = doc.durationMinutes!;
    return filterIds.some(durationId => {
      const duration = this.durationMap[durationId];
      return duration && minutes >= duration.min && minutes < duration.max;
    });
  }

  getOptions(): FilterOption[] {
    return Object.values(this.durationMap);
  }

  hasActiveFilters(filterIds: string[]): boolean {
    return filterIds.length > 0;
  }
}
