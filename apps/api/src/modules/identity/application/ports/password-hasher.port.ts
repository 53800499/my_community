import { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';

/**
 * Port Hexagonal : Hachage et Vérification Cryptographique des Mots de Passe (DIP)
 * Isole la logique métier du fournisseur sous-jacent (Argon2, Scrypt, PBKDF2).
 */
export abstract class PasswordHasherPort {
  abstract hash(plainText: string): Promise<PasswordHash>;
  abstract verify(plainText: string, hash: PasswordHash): Promise<boolean>;
}

export const PASSWORD_HASHER_PORT = Symbol('PASSWORD_HASHER_PORT');
