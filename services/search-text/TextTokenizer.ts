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
    return text
      .toLowerCase()
      .replace(/[^\w\sáéíóúüñ]/g, '')
      .split(/\s+/)
      .filter(token => token.length >= this.MIN_TOKEN_LENGTH)
      .map(token => this.stemWord(token));
  }

  private stemWord(word: string): string {
    const stemWordManager = new StemmerWord(word);
    stemWordManager.stemPlural()
    stemWordManager.stemSuffixes();
    return stemWordManager.getWord();
  }
}
