export class FuzzyMatcher {
  private distanceCache: Map<string, number> = new Map();
  private readonly MAX_FUZZY_DISTANCE = 1;
  private readonly MIN_TOKEN_LENGTH = 3;

  findMatches(queryToken: string, tokens: string[]): string[] {
    if (queryToken.length < this.MIN_TOKEN_LENGTH) return [];

    const maxDistance = Math.min(
      this.MAX_FUZZY_DISTANCE,
      Math.floor(queryToken.length / 3)
    );

    const exactMatches = tokens.filter(token =>
      token === queryToken || token.startsWith(queryToken)
    );
    if (exactMatches.length > 0) return exactMatches;

    return tokens
      .filter(token => {
        if (Math.abs(token.length - queryToken.length) > maxDistance) {
          return false;
        }
        const distance = this.getCachedDistance(queryToken, token);
        return distance <= maxDistance;
      })
      .sort((a, b) => {
        const distA = this.getCachedDistance(queryToken, a);
        const distB = this.getCachedDistance(queryToken, b);
        return distA - distB;
      });
  }

  private getCachedDistance(a: string, b: string): number {
    const [str1, str2] = [a, b].sort();
    const cacheKey = `${str1}:${str2}`;

    const cached = this.distanceCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const distance = this.levenshteinDistance(str1, str2);
    this.distanceCache.set(cacheKey, distance);
    return distance;
  }

  private levenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const maxDistance = this.MAX_FUZZY_DISTANCE;
    if (Math.abs(a.length - b.length) > maxDistance) {
      return maxDistance + 1;
    }

    const matrix: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  }
}
