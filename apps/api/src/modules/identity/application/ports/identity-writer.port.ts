import { UserAccountEntity } from '../../domain/entities/user-account.entity.js';

/**
 * Port Hexagonal : Mutation et Persistance des Comptes Utilisateurs (ISP)
 * Ségrégation stricte des opérations d'écriture pour l'identité.
 */
export abstract class IdentityWriterPort {
  abstract save(account: UserAccountEntity): Promise<void>;
  abstract update(account: UserAccountEntity): Promise<void>;
}

export const IDENTITY_WRITER_PORT = Symbol('IDENTITY_WRITER_PORT');
