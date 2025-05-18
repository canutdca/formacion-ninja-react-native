import { FilterOption } from "@/components/search/filters/FilterPanel";
import { CourseItemWithDuration } from "./SearcherFilter";

export interface FilterStrategy {
  buildMap(documents: CourseItemWithDuration[]): void;
  matchesFilter(doc: CourseItemWithDuration, filterIds: string[]): boolean;
  getOptions(): FilterOption[];
  hasActiveFilters(filterIds: string[]): boolean;
}
