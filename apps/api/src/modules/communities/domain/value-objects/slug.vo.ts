/**
 * Value Object Pur : Slug de Communauté
 * Garantit un identifiant textuel normalisé, sécurisé pour les URLs et les index uniques.
 */
export class Slug {
  private readonly _value: string;

  constructor(raw: string) {
    const slug = Slug.slugify(raw);
    if (!slug || slug.length < 2) {
      throw new Error(`Le slug généré "${slug}" est trop court (min. 2 caractères).`);
    }
    this._value = slug;
  }

  public static slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 150);
  }

  public get value(): string {
    return this._value;
  }

  public toString(): string {
    return this._value;
  }
}
