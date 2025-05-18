import { FilterOption } from "@/components/search/filters/FilterPanel";
import { FilterStrategy } from "./FilterStrategy";
import { CourseItemWithDuration } from "./SearcherFilter";

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

interface LevelOption extends FilterOption {
  id: string;
  count: number;
}

export class LevelFilterStrategy implements FilterStrategy {
  private levelMap: Record<string, LevelOption> = {
    [CourseLevel.BEGINNER]: { id: CourseLevel.BEGINNER, label: 'Principiante', count: 0 },
    [CourseLevel.INTERMEDIATE]: { id: CourseLevel.INTERMEDIATE, label: 'Intermedio', count: 0 },
    [CourseLevel.ADVANCED]: { id: CourseLevel.ADVANCED, label: 'Avanzado', count: 0 },
  };

  private readonly BEGINNER_KEYWORDS = ['básico', 'introducción'];
  private readonly ADVANCED_KEYWORDS = ['avanzado', 'superior'];

  private determineLevel(title: string): CourseLevel {
    const lowerTitle = title.toLowerCase();
    if (this.BEGINNER_KEYWORDS.some(keyword => lowerTitle.includes(keyword))) {
      return CourseLevel.BEGINNER;
    }
    if (this.ADVANCED_KEYWORDS.some(keyword => lowerTitle.includes(keyword))) {
      return CourseLevel.ADVANCED;
    }
    return CourseLevel.INTERMEDIATE;
  }

  buildMap(documents: CourseItemWithDuration[]): void {
    Object.values(this.levelMap).forEach(level => {
      level.count = 0;
    });

    documents.forEach(doc => {
      const level = this.determineLevel(doc.title);
      const levelOption = this.levelMap[level];
      if (levelOption) {
        levelOption.count++;
      }
    });
  }

  matchesFilter(doc: CourseItemWithDuration, filterIds: string[]): boolean {
    if (filterIds.length === 0) return true;
    const level = this.determineLevel(doc.title);
    return filterIds.includes(level);
  }

  getOptions(): FilterOption[] {
    return Object.values(this.levelMap);
  }

  hasActiveFilters(filterIds: string[]): boolean {
    return filterIds.length > 0;
  }
}
