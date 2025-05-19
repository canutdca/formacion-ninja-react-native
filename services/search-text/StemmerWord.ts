export class StemmerWord {

  private readonly suffixes = ['ción', 'ciones', 'mente', 'dad', 'dades', 'ando', 'endo', 'ado', 'ido', 'aba', 'ía'];

  constructor(private word: string) {}

  getWord(): string {
    return this.word;
  }

  stemPlural(): void {
    if (this.word.endsWith('es') && this.word.length > 4)
    this.word = this.word.slice(0, -2);
    if (this.word.endsWith('s') && this.word.length > 3)
    this.word =  this.word.slice(0, -1);
  }

  stemSuffixes(): void {
    for (const suffix of this.suffixes) {
      if (this.word.endsWith(suffix) && this.word.length > suffix.length + 2) {
        this.word = this.word.slice(0, -suffix.length);
        return
      }
    }
  }
}
