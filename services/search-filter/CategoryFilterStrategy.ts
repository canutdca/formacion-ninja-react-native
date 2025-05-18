import { FilterOption } from "@/components/search/filters/FilterPanel";
import { FilterStrategy } from "./FilterStrategy";
import { CourseItemWithDuration } from "./SearcherFilter";

export class CategoryFilterStrategy implements FilterStrategy {
  private categoryMap: Record<string, FilterOption> = {};

  buildMap(documents: CourseItemWithDuration[]): void {
	const categories = new Map<string, number>();

	documents.forEach(doc => {
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

  matchesFilter(doc: CourseItemWithDuration, filterIds: string[]): boolean {
	if (filterIds.length === 0) return true;
	const categoryId = this.normalizeForId(doc.category);
	return filterIds.includes(categoryId);
  }

  getOptions(): FilterOption[] {
	return Object.values(this.categoryMap);
  }

  hasActiveFilters(filterIds: string[]): boolean {
	return filterIds.length > 0;
  }

  private normalizeForId(text: string): string {
	return text
	  .toLowerCase()
	  .replace(/[^\w]/g, '_');
  }
}
