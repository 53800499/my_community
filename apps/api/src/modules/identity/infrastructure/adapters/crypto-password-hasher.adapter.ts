import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PasswordHasherPort } from '../../application/ports/password-hasher.port.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';

const scryptAsync = promisify(scrypt);

/**
 * Adaptateur d'Infrastructure : Hachage Cryptographique Scrypt (OWASP / NIST)
 * Implémente le port PasswordHasherPort via les primitives natives de node:crypto.
 * Utilise un sel cryptographique aléatoire de 16 octets et une comparaison à temps constant.
 */
@Injectable()
export class CryptoPasswordHasherAdapter implements PasswordHasherPort {
  private static readonly KEY_LENGTH = 64;

  async hash(plainText: string): Promise<PasswordHash> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(
      plainText,
      salt,
      CryptoPasswordHasherAdapter.KEY_LENGTH,
    )) as Buffer;

    const formattedHash = `scrypt$${salt}$${derivedKey.toString('hex')}`;
    return new PasswordHash(formattedHash);
  }

  async verify(plainText: string, hash: PasswordHash): Promise<boolean> {
    const parts = hash.getValue().split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }

    const salt = parts[1];
    const storedKeyHex = parts[2];
    const storedKeyBuffer = Buffer.from(storedKeyHex, 'hex');

    try {
      const derivedKey = (await scryptAsync(
        plainText,
        salt,
        CryptoPasswordHasherAdapter.KEY_LENGTH,
      )) as Buffer;

      if (derivedKey.length !== storedKeyBuffer.length) {
        return false;
      }

      return timingSafeEqual(derivedKey, storedKeyBuffer);
    } catch {
      return false;
    }
  }
}
