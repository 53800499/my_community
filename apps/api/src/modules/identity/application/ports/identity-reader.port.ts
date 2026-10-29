import { UserAccountEntity } from '../../domain/entities/user-account.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';

/**
 * Port Hexagonal : Lecture des Comptes Utilisateurs (ISP)
 * Ségrégation stricte des opérations de consultation d'identité.
 */
export abstract class IdentityReaderPort {
  abstract findById(id: string): Promise<UserAccountEntity | null>;
  abstract findByEmail(email: Email): Promise<UserAccountEntity | null>;
  abstract findByPhoneNumber(phoneNumber: PhoneNumber): Promise<UserAccountEntity | null>;
}

export const IDENTITY_READER_PORT = Symbol('IDENTITY_READER_PORT');
