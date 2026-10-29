/**
 * Value Object Immuable : Numéro de Téléphone
 * Normalise les espaces/tirets et valide la structure téléphonique internationale.
 */
export class PhoneNumber {
  private static readonly PHONE_REGEX = /^\+?[0-9]{8,15}$/;

  private readonly value: string;

  constructor(rawPhone: string) {
    if (!rawPhone) {
      throw new Error('Le numéro de téléphone est obligatoire.');
    }
    const sanitized = rawPhone.replace(/[\s\-.()]/g, '');
    if (!PhoneNumber.PHONE_REGEX.test(sanitized)) {
      throw new Error(`Format de numéro de téléphone invalide : "${rawPhone}"`);
    }
    this.value = sanitized;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: PhoneNumber | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
