import { CourseItemProps } from "@/components/CourseItem";
import { FuzzyMatcher } from "./FuzzyMatcher";
import { TextTokenizer } from "./TextTokenizer";

export class SearcherText {
  private invertedIndex: Record<string, Set<string>> = {};
  private documentMap: Record<string, CourseItemProps> = {};
  private tokenizer: TextTokenizer;
  private fuzzyMatcher: FuzzyMatcher;

  constructor(documents: CourseItemProps[]) {
    this.tokenizer = new TextTokenizer();
    this.fuzzyMatcher = new FuzzyMatcher();

    documents.forEach(doc => {
      this.documentMap[doc.id] = doc;
      this.indexDocument(doc);
    });
  }

  private indexDocument(doc: CourseItemProps): void {
    const titleTokens = this.tokenizer.getTokens(doc.title);
    const categoryTokens = this.tokenizer.getTokens(doc.category);
    const instructorTokens = this.tokenizer.getTokens(doc.instructor);

    this.indexTokens(titleTokens, doc.id);
    this.indexTokens(categoryTokens, doc.id);
    this.indexTokens(instructorTokens, doc.id);
  }

  private indexTokens(tokens: string[], docId: string): void {
    tokens.forEach(token => {
      if (!this.invertedIndex[token]) {
        this.invertedIndex[token] = new Set<string>();
      }
      this.invertedIndex[token].add(docId);
    });
  }

  search(query: string, documentIds: Set<string>): CourseItemProps[] {
    if (!query) {
      return Array.from(documentIds).map(id => this.documentMap[id]);
    }

    const queryTokens = this.tokenizer.getTokens(query);
    const filteredResults = new Set<string>();

    const exactMatches = this.exactSearch(queryTokens);
    exactMatches.forEach(id => {
      if (documentIds.has(id)) {
        filteredResults.add(id);
      }
    });

    if (filteredResults.size < 10) {
      const fuzzyMatches = this.fuzzySearch(queryTokens);
      fuzzyMatches.forEach(id => {
        if (documentIds.has(id)) {
          filteredResults.add(id);
        }
      });
    }

    return Array.from(filteredResults)
      .map(id => this.documentMap[id])
      .sort((a, b) => a.title.localeCompare(b.title));
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

    for (const queryToken of queryTokens) {
      const candidates = this.fuzzyMatcher.findMatches(queryToken, allTokens);
      for (const candidate of candidates) {
        this.invertedIndex[candidate].forEach(id => fuzzyMatches.add(id));
      }
    }

    return Array.from(fuzzyMatches);
  }

  getSuggestions(query: string, limit = 5): string[] {
    if (!query) return [];

    const queryTokens = this.tokenizer.getTokens(query);
    if (queryTokens.length === 0) return [];

    const firstToken = queryTokens[0];
    const suggestions = new Set<string>();

    Object.values(this.documentMap).forEach(doc => {
      const docTokens = this.tokenizer.getTokens(doc.title);
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
}
