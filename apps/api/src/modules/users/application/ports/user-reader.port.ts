import { UserProfileEntity } from '../../domain/entities/user-profile.entity.js';

/**
 * Port Sortant Hexagonal : Consultation des Profils Utilisateurs (ISP)
 * Ségrégation stricte des opérations de lecture pour le domaine Users.
 */
export abstract class UserReaderPort {
  abstract findByUserId(userId: string): Promise<UserProfileEntity | null>;
  abstract findById(id: string): Promise<UserProfileEntity | null>;
}

export const USER_READER_PORT = Symbol('USER_READER_PORT');
