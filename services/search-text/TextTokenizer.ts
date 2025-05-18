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
}
