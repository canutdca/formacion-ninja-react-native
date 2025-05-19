import { StemmerWord } from "./StemmerWord";

export class TextTokenizer {
  private tokenCache: Map<string, string[]> = new Map();
  private readonly MIN_TOKEN_LENGTH = 2;

  getTokens(text: string): string[] {
    const cached = this.tokenCache.get(text);
    if (cached) return cached;

    const tokens = this.tokenize(text);
    this.tokenCache.set(text, tokens);
    return tokens;
  }

  private tokenize(text: string): string[] {
    return this.normalizeText(text)
      .split(/\s+/)
      .filter(token => token.length >= this.MIN_TOKEN_LENGTH)
      .map(token => this.stemWord(token));
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s]/g, ''); // Remove special characters
  }

  private stemWord(word: string): string {
    const stemWordManager = new StemmerWord(word);
    stemWordManager.stemPlural()
    stemWordManager.stemSuffixes();
    return stemWordManager.getWord();
  }
}
