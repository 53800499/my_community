import { CommunityEntity } from '../../domain/entities/community.entity.js';

/**
 * Port Sortant Hexagonal : Écriture et Mutation de Communautés
 * Conforme ISP (Interface Segregation Principle) :
 * Isole les méthodes de persistance et de mise à jour afin que les Use Cases
 * de commande dépendent uniquement des opérations d'écriture requises.
 */
export abstract class CommunityWriterPort {
  abstract save(community: CommunityEntity): Promise<void>;
  abstract updateStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

export const COMMUNITY_WRITER_PORT = Symbol('COMMUNITY_WRITER_PORT');
