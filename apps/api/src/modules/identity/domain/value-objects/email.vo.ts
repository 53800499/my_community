/**
 * Value Object Immuable : Adresse Email
 * Assure la validation syntaxique et la normalisation en minuscules.
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly value: string;

  constructor(email: string) {
    const trimmed = email.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Adresse email invalide : "${email}"`);
    }
    this.value = trimmed;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
