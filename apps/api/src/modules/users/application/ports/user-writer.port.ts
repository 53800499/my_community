import { UserProfileEntity } from '../../domain/entities/user-profile.entity.js';

/**
 * Port Sortant Hexagonal : Mutation et Persistance des Profils Utilisateurs (ISP)
 * Ségrégation stricte des opérations d'écriture pour le domaine Users.
 */
export abstract class UserWriterPort {
  abstract save(profile: UserProfileEntity): Promise<void>;
  abstract update(profile: UserProfileEntity): Promise<void>;
}

export const USER_WRITER_PORT = Symbol('USER_WRITER_PORT');
