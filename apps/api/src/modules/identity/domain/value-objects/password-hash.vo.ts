/**
 * Value Object Immuable : Empreinte de Mot de Passe Sécurisée
 * Garantit que le mot de passe stocké est une empreinte non vide.
 */
export class PasswordHash {
  private readonly value: string;

  constructor(hash: string) {
    if (!hash || hash.trim().length === 0) {
      throw new Error("L'empreinte du mot de passe ne peut pas être vide.");
    }
    this.value = hash.trim();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: PasswordHash | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
